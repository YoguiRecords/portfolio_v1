/**
 * Seed de CONTENU éditorial (distinct du seed admin `seed.ts`).
 *
 * Reproduit le contenu des maquettes pour amorcer le site : réglages, sections
 * de la home, profil, KPI, compétences, parcours (4 voies), objectifs, analyses
 * (SWOT/PESTEL/PORTER) et un projet « étude de cas » avec ses blocs.
 *
 * Idempotent : remet à plat le contenu éditorial puis le recrée. N'exige PAS
 * les identifiants admin (uniquement `DATABASE_URL`).
 *
 * Lancer : `pnpm --filter @portfolio/db exec tsx prisma/seed-content.ts`
 */
import { hashSource } from "@portfolio/core";
import { prisma } from "../src/index";

async function main(): Promise<void> {
  // 1. Reset du contenu éditorial (les FK enfants tombent en cascade)
  await prisma.translation.deleteMany();
  // Profil = singleton : on repart d'une fiche propre (évite les doublons → le
  // loader public faisait un findFirst non déterministe sur la mauvaise).
  await prisma.profile.deleteMany();
  await prisma.appointmentRequest.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.event.deleteMany();
  await prisma.article.deleteMany();
  await prisma.project.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.careerTrack.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.language.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.homeSection.deleteMany();
  await prisma.faqEntry.deleteMany();
  await prisma.testimonial.deleteMany();

  // 2. Réglages du site (singleton)
  const settings = await prisma.siteSettings.findFirst();
  const settingsData = {
    brandName: "Yohan.",
    siteName: "Yohan Debusscher — Portfolio",
    defaultSeoTitle: "Yohan Debusscher — Concepteur-développeur & entrepreneur",
    defaultSeoDescription:
      "Concepteur-développeur & entrepreneur. Vision produit, management d'équipe et exécution technique — de la stratégie au déploiement.",
    footerHeadline: "La suite s'écrit ensemble.",
    footerSignature: "Vision · management · exécution",
    contactEmail: "debusscher.yohan@gmail.com",
    availabilityBanner: "Disponible · ouvert aux missions",
    allowAiCrawlers: true,
    llmsTxt:
      "# Yohan Debusscher\nConcepteur-développeur & entrepreneur (manager, cap CTO/CEO).\nProfil hybride : tech + pédagogie + management + business.",
  };
  if (settings) {
    await prisma.siteSettings.update({ where: { id: settings.id }, data: settingsData });
  } else {
    await prisma.siteSettings.create({ data: settingsData });
  }

  // 3. Profil (singleton)
  const profile = await prisma.profile.findFirst();
  const profileData = {
    fullName: "Yohan Debusscher",
    headline: "Concepteur-développeur & entrepreneur",
    bio: "Je porte une vision produit, je pilote des équipes et je garde les mains dans le code — de la stratégie jusqu'à la production.",
    email: "debusscher.yohan@gmail.com",
    location: "Lille · France",
    typewriterLines: [
      "Je conçois des produits.",
      "Je pilote des équipes.",
      "Je livre, en vrai.",
      "Je pense business.",
    ],
    sigText: "vision · management · exécution",
    isAvailable: true,
    availabilityLabel: "Disponible · ouvert aux missions",
    currentRole: "Indépendant · fondateur",
    aiSummary:
      "Yohan Debusscher est concepteur-développeur et entrepreneur. Profil hybride (tech, pédagogie, management, business) qui conçoit, pilote et livre des produits de bout en bout. Cap de carrière : manager, CTO puis CEO.",
    cvAccroche:
      "Concepteur-développeur et entrepreneur. Profil hybride (tech, pédagogie, management, business) qui conçoit, pilote et livre des produits de bout en bout — de la stratégie à la production.",
    cvAvailabilityStart: "Immédiate",
    cvMobility: "Hauts-de-France · remote",
    cvContractType: "CDI · freelance",
  };
  if (profile) {
    await prisma.profile.update({ where: { id: profile.id }, data: profileData });
  } else {
    await prisma.profile.create({ data: profileData });
  }

  // 3b. Avatar — image stockée dans MinIO (bucket `media`, lecture publique).
  // L'URL de base est pilotée par l'environnement (jamais en dur dans le code).
  const mediaBase = process.env.MEDIA_PUBLIC_BASE_URL ?? "http://localhost:9100/media";
  const avatarUrl = `${mediaBase}/profile.webp`;
  const avatar = await prisma.mediaAsset.upsert({
    where: { url: avatarUrl },
    update: {},
    create: {
      url: avatarUrl,
      alt: "Yohan Debusscher",
      originalName: "profile.webp",
      mimeType: "image/webp",
      sizeBytes: 17916,
      width: 455,
      height: 667,
      kind: "IMAGE",
    },
  });
  const profileForAvatar = await prisma.profile.findFirst();
  if (profileForAvatar) {
    await prisma.profile.update({
      where: { id: profileForAvatar.id },
      data: { avatarId: avatar.id },
    });
  }

  // 4. Sections de la home (titres / intros / CTA / ordre)
  await prisma.homeSection.createMany({
    data: [
      { key: "hero", navLabel: "Accueil", eyebrow: "Un portfolio de Yohan Debusscher", order: 0 },
      { key: "profil", navLabel: "Profil", eyebrow: "Chapitre 01 — Qui je suis", title: "Le profil, en clair.", intro: "Un même cerveau qui parle aux marchés et aux machines.", order: 1 },
      { key: "ecosysteme", navLabel: "Écosystème", eyebrow: "Chapitre 02 — Écosystème", title: "Ce que je maîtrise.", intro: "Au centre, moi. Autour, mes compétences et projets.", order: 2 },
      { key: "parcours", navLabel: "Parcours", eyebrow: "Chapitre 03 — La trajectoire", title: "Quatre voies, étalées dans le temps.", intro: "Dev, pédagogie, management et business — chacun sa voie, convergeant aujourd'hui.", order: 3 },
      { key: "cap", navLabel: "Cap", eyebrow: "Chapitre 04 — Le cap", title: "Où je suis, où je vais.", intro: "Une trajectoire assumée vers la direction technique et générale.", order: 4 },
      { key: "projets", navLabel: "Projets", eyebrow: "Chapitre 05 — Les preuves", title: "Ce que j'ai livré.", intro: "Chaque projet est une scène : un problème, une démarche, un résultat.", order: 5 },
      { key: "footer", title: "La suite s'écrit ensemble.", order: 6 },
    ],
  });

  // 4b. Overlay EN de la home (profil + sections) — pour un vrai rendu bilingue.
  // En prod, ces traductions sont (re)générées par l'IA à l'enregistrement du FR.
  const sectionRows = await prisma.homeSection.findMany();
  const profileRow = await prisma.profile.findFirst();

  /** Crée une traduction EN d'un champ (sourceHash = hash du FR source). */
  async function en(model: string, recordId: string, field: string, fr: string, value: string) {
    await prisma.translation.create({
      data: { model, recordId, field, locale: "en", value, isAuto: true, sourceHash: hashSource(fr) },
    });
  }

  const sectionEn: Record<string, { navLabel?: [string, string]; eyebrow?: [string, string]; title?: [string, string]; intro?: [string, string] }> = {
    hero: { navLabel: ["Accueil", "Home"], eyebrow: ["Un portfolio de Yohan Debusscher", "A portfolio by Yohan Debusscher"] },
    profil: {
      navLabel: ["Profil", "Profile"],
      eyebrow: ["Chapitre 01 — Qui je suis", "Chapter 01 — Who I am"],
      title: ["Le profil, en clair.", "The profile, in clear."],
      intro: ["Un même cerveau qui parle aux marchés et aux machines.", "One mind that speaks to both markets and machines."],
    },
    ecosysteme: {
      navLabel: ["Écosystème", "Ecosystem"],
      eyebrow: ["Chapitre 02 — Écosystème", "Chapter 02 — Ecosystem"],
      title: ["Ce que je maîtrise.", "What I master."],
      intro: ["Au centre, moi. Autour, mes compétences et projets.", "At the center, me. Around it, my skills and projects."],
    },
    parcours: {
      navLabel: ["Parcours", "Path"],
      eyebrow: ["Chapitre 03 — La trajectoire", "Chapter 03 — The trajectory"],
      title: ["Quatre voies, étalées dans le temps.", "Four paths, spread over time."],
      intro: ["Dev, pédagogie, management et business — chacun sa voie, convergeant aujourd'hui.", "Dev, teaching, management and business — each its own path, all converging today."],
    },
    cap: {
      navLabel: ["Cap", "Heading"],
      eyebrow: ["Chapitre 04 — Le cap", "Chapter 04 — The heading"],
      title: ["Où je suis, où je vais.", "Where I am, where I'm headed."],
      intro: ["Une trajectoire assumée vers la direction technique et générale.", "A deliberate path toward technical and general leadership."],
    },
    projets: {
      navLabel: ["Projets", "Projects"],
      eyebrow: ["Chapitre 05 — Les preuves", "Chapter 05 — The proof"],
      title: ["Ce que j'ai livré.", "What I've shipped."],
      intro: ["Chaque projet est une scène : un problème, une démarche, un résultat.", "Each project is a scene: a problem, an approach, a result."],
    },
    footer: { title: ["La suite s'écrit ensemble.", "The rest is written together."] },
  };

  for (const s of sectionRows) {
    const t = sectionEn[s.key];
    if (!t) continue;
    if (t.navLabel) await en("HomeSection", s.id, "navLabel", t.navLabel[0], t.navLabel[1]);
    if (t.eyebrow) await en("HomeSection", s.id, "eyebrow", t.eyebrow[0], t.eyebrow[1]);
    if (t.title) await en("HomeSection", s.id, "title", t.title[0], t.title[1]);
    if (t.intro) await en("HomeSection", s.id, "intro", t.intro[0], t.intro[1]);
  }

  if (profileRow) {
    await en("Profile", profileRow.id, "headline", profileRow.headline, "Product engineer & entrepreneur");
    await en("Profile", profileRow.id, "bio", profileRow.bio, "I carry a product vision, lead teams and keep my hands in the code — from strategy all the way to production.");
    await en("Profile", profileRow.id, "currentRole", profileRow.currentRole ?? "", "Independent · founder");
    await en("Profile", profileRow.id, "availabilityLabel", profileRow.availabilityLabel ?? "", "Available · open to projects");
    await en("Profile", profileRow.id, "aiSummary", profileRow.aiSummary ?? "", "Yohan Debusscher is a product engineer and entrepreneur. A hybrid profile (tech, teaching, management, business) who designs, leads and ships products end to end. Career heading: manager, then CTO, then CEO.");
  }

  // 5. KPI
  await prisma.kpi.createMany({
    data: [
      { label: "Expérience", value: "4 ans", note: "en hausse", trend: "UP", order: 0, showOnCv: true },
      { label: "Périmètre", value: "Tech + Business", note: "vision × exécution", order: 1, showOnCv: true },
      { label: "Management", value: "Équipes pilotées", note: "leadership", trend: "UP", order: 2, showOnCv: true },
      { label: "Recommandation", value: "Strong hire", note: "disponible", trend: "UP", order: 3 },
    ],
  });

  // 5b. FAQ globale (page /faq publique + FAQPage JSON-LD). Éditable au BO.
  await prisma.faqEntry.createMany({
    data: [
      {
        scope: "GLOBAL",
        order: 0,
        question: "Quels types de missions ?",
        answer:
          "Direction produit et technique : cadrage, pilotage d'équipe et livraison de bout en bout — de la stratégie jusqu'à la mise en production sécurisée.",
      },
      {
        scope: "GLOBAL",
        order: 1,
        question: "Es-tu disponible ?",
        answer:
          "Disponible et ouvert aux opportunités (CDI · freelance), en Hauts-de-France ou en remote. Écris-moi via la page contact.",
      },
      {
        scope: "GLOBAL",
        order: 2,
        question: "Tu interviens seul ou avec une équipe ?",
        answer:
          "Je porte la vision et je pilote l'exécution : selon le besoin, je manage une équipe ou je livre directement, tout en gardant les mains dans le code.",
      },
      {
        scope: "GLOBAL",
        order: 3,
        question: "Comment se passe un projet ?",
        answer:
          "Cadrage et priorisation, itérations livrées régulièrement, sécurité intégrée dès le départ, et une communication claire à chaque étape.",
      },
    ],
  });

  // 5c. Chatbot public — e-secrétaire IA « Ada » (modèle propre + persona concise).
  // Le prénom et le cadrage « e-secrétaire » vivent dans le prompt de base ; la persona
  // ne porte que le TON (synthétique, longueur adaptée à la question).
  const chatPersona = [
    "Sois TRÈS concise et naturelle, et ADAPTE la longueur à la question : à un simple bonjour,",
    "réponds par un bonjour bref et une question ouverte, SANS dérouler le profil de Yohan.",
    "Ne donne des détails que si on te les demande, et le strict nécessaire. Parle de Yohan à la",
    "troisième personne, mets-le en avant, ne cite jamais un concurrent, propose un rendez-vous en",
    "cas de besoin et renvoie à la page contact si tu ignores une information. Pas de longues listes,",
    "pas de méta-commentaire, aucune mention de modèles d'IA.",
  ].join(" ");
  const aiData = {
    model: "deepseek/deepseek-v4-flash",
    assistantName: "Friday",
    systemPersona: chatPersona,
  };
  const aiConfig = await prisma.aiAssistantConfig.findFirst();
  if (aiConfig) {
    await prisma.aiAssistantConfig.update({ where: { id: aiConfig.id }, data: aiData });
  } else {
    await prisma.aiAssistantConfig.create({ data: aiData });
  }

  // 6. Compétences (écosystème) — TECH (5 catégories CV) + SOFT (soft skills CV)
  await prisma.skill.createMany({
    data: [
      { name: "Full-stack", kind: "TECH", category: "Développement", showOnCv: true, order: 0 },
      { name: "Architecture", kind: "TECH", category: "Développement", showOnCv: true, order: 1 },
      { name: "Gestion de projet", kind: "TECH", category: "Gestion de projet", showOnCv: true, order: 2 },
      { name: "Management d'équipe", kind: "TECH", category: "Management", showOnCv: true, order: 3 },
      { name: "Sécurité", kind: "TECH", category: "Développement", showOnCv: true, order: 4 },
      { name: "IA & orchestration", kind: "TECH", category: "IA & Orchestration", showOnCv: true, order: 5 },
      { name: "Communication", kind: "TECH", category: "Communication", showOnCv: true, order: 6 },
      { name: "Leadership", kind: "SOFT", showOnCv: true, order: 7 },
      { name: "Rigueur", kind: "SOFT", showOnCv: true, order: 8 },
      { name: "Pédagogie", kind: "SOFT", showOnCv: true, order: 9 },
    ],
  });

  // 6b. Corpus CV — expériences (3 tiers), formations, langues, intérêts
  await prisma.experience.createMany({
    data: [
      {
        title: "Directeur adjoint & fondateur",
        company: "Indépendant",
        location: "Hauts-de-France",
        startDate: new Date("2024-01-01"),
        endDate: null,
        tier: "FEATURED",
        badge: "EN_COURS",
        stack: ["Next.js", "TypeScript", "Docker", "PostgreSQL"],
        bullets: [
          "Conception et pilotage de produits de bout en bout.",
          "Management d'équipe et coordination pédagogique.",
        ],
        description:
          "Direction d'une structure et d'une équipe, tout en concevant et livrant des produits techniques de bout en bout.",
        order: 0,
        showOnPdf: true,
        showOnCvPage: true,
        showOnSite: false,
      },
      {
        title: "Gestionnaire de projet & encadrement",
        company: "École",
        location: "Hauts-de-France",
        startDate: new Date("2022-01-01"),
        endDate: new Date("2023-12-31"),
        tier: "PREVIOUS",
        badge: "CLE",
        stack: ["Gestion de projet", "Management"],
        bullets: ["Cadrage, priorisation et livraison.", "Encadrement et montée en compétence d'équipe."],
        order: 1,
        showOnPdf: true,
        showOnCvPage: true,
      },
      {
        title: "Développeur",
        company: "Divers",
        startDate: new Date("2019-01-01"),
        endDate: new Date("2021-12-31"),
        tier: "MINI",
        badge: "NONE",
        stack: ["JavaScript", "PHP"],
        bullets: ["Premières livraisons logicielles."],
        order: 2,
        showOnPdf: true,
        showOnCvPage: true,
      },
    ],
  });
  await prisma.education.createMany({
    data: [
      {
        title: "Master informatique",
        institution: "Université",
        date: "2018 — 2020",
        details: ["Spécialité génie logiciel"],
        order: 0,
      },
      {
        title: "Licence informatique",
        institution: "Université",
        date: "2015 — 2018",
        details: [],
        order: 1,
      },
    ],
  });
  await prisma.language.createMany({
    data: [
      { name: "Français", level: "Langue maternelle", order: 0 },
      { name: "Anglais", level: "C1 — professionnel", order: 1 },
    ],
  });
  await prisma.interest.createMany({
    data: [
      { label: "Course à pied", order: 0 },
      { label: "Jeux vidéo & game design", order: 1 },
      { label: "Entrepreneuriat", order: 2 },
    ],
  });

  // 7. Parcours — 4 voies + jalons
  const tracks = [
    { slug: "dev", name: "Dev", colorHex: "#f0a800", order: 0, milestones: [
      { dateLabel: "2019", sortYear: 2019, role: "Développeur", description: "Premières livraisons." },
      { dateLabel: "2021", sortYear: 2021, role: "Ingénieur", description: "Architecture & responsabilité." },
      { dateLabel: "2022", sortYear: 2022, role: "Full-stack", description: "Du front à l'infra." },
    ] },
    { slug: "pedagogie", name: "Pédagogie", colorHex: "#b78bd0", order: 1, milestones: [
      { dateLabel: "2020", sortYear: 2020, role: "Professeur", description: "Transmettre, structurer." },
      { dateLabel: "2022", sortYear: 2022, role: "Référent pédagogique", description: "Coordonner l'équipe pédago." },
    ] },
    { slug: "management", name: "Management", colorHex: "#e0892f", order: 2, milestones: [
      { dateLabel: "2022", sortYear: 2022, role: "Gestion de projet", description: "Cadrer, prioriser, livrer." },
      { dateLabel: "2023", sortYear: 2023, role: "Encadrement", description: "Faire grandir une équipe." },
      { dateLabel: "2024", sortYear: 2024, role: "Directeur adjoint d'école", description: "Diriger une structure & une équipe." },
    ] },
    { slug: "business", name: "Business", colorHex: "#8fb2c9", order: 3, milestones: [
      { dateLabel: "2023", sortYear: 2023, role: "Entrepreneuriat", description: "Vision produit & marché." },
      { dateLabel: "2024", sortYear: 2024, role: "Étude PME", description: "Marché, SWOT, reco." },
    ] },
  ];
  for (const t of tracks) {
    await prisma.careerTrack.create({
      data: {
        slug: t.slug, name: t.name, colorHex: t.colorHex, order: t.order,
        milestones: { create: t.milestones.map((m, i) => ({ ...m, order: i })) },
      },
    });
  }

  // 8. Objectifs de carrière (le cap)
  await prisma.careerGoal.createMany({
    data: [
      { role: "Développeur", status: "ACHIEVED", order: 0 },
      { role: "Salarié en entreprise", status: "ACHIEVED", order: 1 },
      { role: "Ingénieur", status: "ACHIEVED", order: 2 },
      { role: "Gestionnaire de projet", status: "ACHIEVED", order: 3 },
      { role: "Indépendant · fondateur", status: "IN_PROGRESS", order: 4 },
      { role: "Manager", status: "TARGET", order: 5 },
      { role: "CTO", status: "TARGET", order: 6 },
      { role: "CEO", status: "HORIZON", order: 7 },
    ],
  });

  // 9. Cadres d'analyse du profil (SWOT · 4P · Golden Circle · Ikigai)
  await prisma.analysis.create({
    data: {
      type: "SWOT", title: "Mon profil", order: 0,
      data: {
        strengths: { label: "Forces", items: ["Vision + management + exécution", "Bilingue tech ↔ business"] },
        weaknesses: { label: "Faiblesses", items: ["Profil hybride à incarner clairement", "Séniorité direction à consolider"] },
        opportunities: { label: "Opportunités", items: ["Demande de leaders tech hybrides", "Rôles CTO / direction produit"] },
        threats: { label: "Menaces", items: ["Spécialistes plus pointus par maillon", "Marché concurrentiel"] },
      },
    },
  });
  await prisma.analysis.create({
    data: {
      type: "FOUR_P", title: "Mon positionnement", order: 1,
      data: {
        product: { label: "Produit", role: "L'offre", points: ["Vision produit + exécution technique", "Leadership d'équipes tech"] },
        price: { label: "Prix", role: "Positionnement", points: ["Séniorité direction (CTO / CPO)", "Valeur = impact business"] },
        place: { label: "Place", role: "Distribution", points: ["Portfolio, LinkedIn, réseau", "Open-source, conférences"] },
        promotion: { label: "Promotion", role: "Communication", points: ["Études de cas chiffrées", "Récit « leader hybride »"] },
      },
    },
  });
  await prisma.analysis.create({
    data: {
      type: "GOLDEN_CIRCLE", title: "Ma raison d'être", order: 2,
      data: {
        why: "Faire émerger des produits tech qui ont du sens, en alignant les gens.",
        how: "En reliant vision business et exécution technique, en faisant grandir les équipes.",
        what: "Je dirige des équipes produit/tech : architecture, delivery, management.",
      },
    },
  });
  await prisma.analysis.create({
    data: {
      type: "IKIGAI", title: "Mon équilibre", order: 3,
      data: {
        love: "Construire, faire grandir des équipes, résoudre des problèmes complexes.",
        good: "Relier la tech et le business, décider, exécuter, manager.",
        world: "Des produits utiles, bien construits, portés par des leaders fiables.",
        paid: "Diriger la tech et le produit : architecture, delivery, vision.",
        center: "Diriger des produits tech qui ont du sens, avec des équipes qui grandissent.",
      },
    },
  });

  // 10. Un projet « étude de cas » (jeu) avec blocs modulaires
  const project = await prisma.project.create({
    data: {
      title: "Domestic Revolt", slug: "domestic-revolt",
      summary: "Conçu, piloté et déployé. Du problème à la mise en production.",
      content: "Étude de cas complète gérée par blocs modulaires.",
      featured: true, status: "PUBLISHED", order: 0,
      showOnCv: true, cvBadge: "KEY",
      type: "GAME", role: "Lead & build", periodLabel: "2024 — 2025",
      statusLabel: "En production", tagline: "Du game design jusqu'à la mise en production sécurisée.",
      sigText: "conçu · piloté · livré",
      seoTitle: "Domestic Revolt — Étude de cas",
      seoDescription: "Produit/jeu conçu, piloté et déployé de bout en bout.",
      aiSummary: "Domestic Revolt : produit/jeu conçu, piloté et déployé seul, du game design à la prod sécurisée.",
      links: { create: [
        { label: "Repo", url: "#", order: 0 },
        { label: "Démo jouable", url: "#", order: 1 },
      ] },
      blocks: { create: [
        { type: "CONTEXT", order: 0, data: { problem: "Le besoin initial.", objective: "Le résultat visé.", role: "Vision, pilotage, exécution." } },
        { type: "PROCESS", order: 1, data: { phases: [
          { label: "Cadrage", start: 0, width: 14 },
          { label: "Conception", start: 10, width: 24 },
          { label: "Développement", start: 24, width: 58 },
          { label: "Sécurité", start: 50, width: 34, style: "green" },
          { label: "Tests / QA", start: 60, width: 28, style: "dark" },
          { label: "Livraison", start: 86, width: 14, style: "soft" },
        ] } },
        { type: "GAME_DESIGN", order: 2, data: {
          pillars: [
            { name: "Tension", desc: "Le ressort émotionnel central." },
            { name: "Maîtrise", desc: "Courbe d'apprentissage et progression." },
            { name: "Rejouabilité", desc: "Ce qui donne envie de relancer." },
          ],
          coreLoop: ["Action", "Feedback", "Récompense", "Progression"],
          mechanics: ["Mécanique principale", "Mécanique secondaire", "Système de récompense", "Élément de variété"],
        } },
        { type: "RESULTS", order: 3, data: { stats: [
          { value: "100%", label: "livré & en production" },
          { value: "0", label: "incident de sécurité" },
        ] } },
      ] },
      faqs: { create: [
        { question: "Le projet est-il en production ?", answer: "Oui, déployé et opérationnel.", scope: "PROJECT", order: 0 },
      ] },
    },
  });

  // 10b. Agenda — un évènement public publié + une actu programmée liée
  const event = await prisma.event.create({
    data: {
      title: "Meetup Dev & Produit",
      slug: "meetup-dev-produit",
      description: "Rencontre autour du build solo de bout en bout.",
      startAt: new Date("2026-09-15T18:30:00Z"),
      locationName: "La Plage Digitale",
      city: "Lille",
      registrationUrl: "https://example.com/inscription",
      visibility: "PUBLIC",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  await prisma.article.create({
    data: {
      title: "Je serai au Meetup Dev & Produit",
      slug: "actu-meetup",
      excerpt: "Rendez-vous le 15 septembre à Lille.",
      content: "Venez échanger sur le build produit de bout en bout.",
      status: "SCHEDULED",
      scheduledAt: new Date("2026-09-01T08:00:00Z"),
      eventId: event.id,
    },
  });
  const buildSolo = await prisma.article.create({
    data: {
      title: "Construire un produit de bout en bout, en solo",
      slug: "build-solo",
      excerpt: "Retour d'expérience : de la vision produit à la mise en production sécurisée.",
      content:
        "## Le constat\n\nPorter un produit **seul**, de la stratégie à la prod, demande de jongler entre vision, exécution et sécurité.\n\n## La méthode\n\n- Cadrer le problème avant le code\n- Automatiser les tests tôt\n- Sécuriser par défaut\n\nPlus de détails sur le [portfolio](/).",
      tags: ["produit", "management", "sécurité"],
      featured: true,
      status: "PUBLISHED",
      readingMinutes: 4,
      publishedAt: new Date("2026-06-20T09:00:00Z"),
    },
  });

  // 11. Témoignages — 1 validé (affiché) + 1 en attente de modération
  await prisma.testimonial.createMany({
    data: [
      {
        authorName: "Claire Moreau", authorRole: "Dirigeante", authorCompany: "Atelier Nord",
        authorRelationship: "CLIENT",
        content: "Yohan a transformé notre idée en produit livré, du cadrage à la prod. Rare et précieux.",
        submittedContent: "Yohan a transformé notre idée en produit livré, du cadrage à la prod. Rare et précieux.",
        rating: 5, status: "APPROVED", isFeatured: true, order: 0, approvedAt: new Date(),
      },
      {
        authorName: "Thomas Leroy", authorRole: "Lead Dev", authorCompany: "OXO",
        authorRelationship: "PEER",
        content: "Vision produit + exécution technique, le tout en pilotant l'équipe. Bluffant.",
        submittedContent: "Vision produit + exécution technique, le tout en pilotant l'équipe. Bluffant.",
        status: "PENDING", order: 1,
      },
    ],
  });

  // 11b. Overlay EN des sous-pages (projet, actu, évènement, témoignage).
  await en("Project", project.id, "summary", project.summary, "Designed, led and shipped — from the problem to production.");
  await en("Project", project.id, "tagline", project.tagline ?? "", "From game design to a secured production release.");
  await en("Article", buildSolo.id, "title", buildSolo.title, "Building a product end to end, solo");
  await en("Article", buildSolo.id, "excerpt", buildSolo.excerpt ?? "", "Field notes: from product vision to a secured production release.");
  await en("Event", event.id, "description", event.description ?? "", "A talk on shipping a product solo, end to end.");
  const featuredTestimonial = await prisma.testimonial.findFirst({ where: { status: "APPROVED" } });
  if (featuredTestimonial) {
    await en(
      "Testimonial",
      featuredTestimonial.id,
      "content",
      featuredTestimonial.content,
      "Yohan turned our idea into a shipped product, from framing to production. Rare and precious.",
    );
  }

  // Comptes de contrôle
  const [sec, hs, kpi, tr, goals, ana, proj, testi, exp, edu, lang, intr] = await Promise.all([
    prisma.siteSettings.count(), prisma.homeSection.count(), prisma.kpi.count(),
    prisma.careerTrack.count(), prisma.careerGoal.count(), prisma.analysis.count(),
    prisma.project.count(), prisma.testimonial.count(),
    prisma.experience.count(), prisma.education.count(), prisma.language.count(), prisma.interest.count(),
  ]);
  console.log(`Seed contenu OK → settings:${sec} sections:${hs} kpi:${kpi} tracks:${tr} goals:${goals} analyses:${ana} projets:${proj} testimonials:${testi} experiences:${exp} educations:${edu} langues:${lang} interets:${intr}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed contenu échoué:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
