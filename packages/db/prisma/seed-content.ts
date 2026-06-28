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
import { prisma } from "../src/index";

async function main(): Promise<void> {
  // 1. Reset du contenu éditorial (les FK enfants tombent en cascade)
  await prisma.event.deleteMany();
  await prisma.article.deleteMany();
  await prisma.project.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.careerTrack.deleteMany();
  await prisma.careerGoal.deleteMany();
  await prisma.kpi.deleteMany();
  await prisma.skill.deleteMany();
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
  };
  if (profile) {
    await prisma.profile.update({ where: { id: profile.id }, data: profileData });
  } else {
    await prisma.profile.create({ data: profileData });
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

  // 5. KPI
  await prisma.kpi.createMany({
    data: [
      { label: "Expérience", value: "4 ans", note: "en hausse", trend: "UP", order: 0 },
      { label: "Périmètre", value: "Tech + Business", note: "vision × exécution", order: 1 },
      { label: "Management", value: "Équipes pilotées", note: "leadership", trend: "UP", order: 2 },
      { label: "Recommandation", value: "Strong hire", note: "disponible", trend: "UP", order: 3 },
    ],
  });

  // 6. Compétences (écosystème)
  await prisma.skill.createMany({
    data: [
      { name: "Full-stack", category: "Compétence", order: 0 },
      { name: "Architecture", category: "Compétence", order: 1 },
      { name: "Management", category: "Compétence", order: 2 },
      { name: "Sécurité", category: "Compétence", order: 3 },
      { name: "Business", category: "Compétence", order: 4 },
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

  // 9. Analyses du profil (SWOT / PESTEL / PORTER)
  await prisma.analysis.create({
    data: {
      type: "SWOT", title: "Mon profil", order: 0,
      items: { create: [
        { groupLabel: "Forces", text: "Vision + management + exécution", order: 0 },
        { groupLabel: "Forces", text: "Bilingue tech ↔ business", order: 1 },
        { groupLabel: "Faiblesses", text: "Profil hybride à incarner clairement", order: 2 },
        { groupLabel: "Faiblesses", text: "Séniorité direction à consolider", order: 3 },
        { groupLabel: "Opportunités", text: "Demande de leaders tech hybrides", order: 4 },
        { groupLabel: "Opportunités", text: "Rôles CTO / direction produit", order: 5 },
        { groupLabel: "Menaces", text: "Spécialistes plus pointus par maillon", order: 6 },
        { groupLabel: "Menaces", text: "Marché concurrentiel", order: 7 },
      ] },
    },
  });
  await prisma.analysis.create({
    data: {
      type: "PESTEL", title: "Contexte", order: 1,
      items: { create: [
        { groupLabel: "Politique", verdict: "Neutre", order: 0 },
        { groupLabel: "Économique", verdict: "Porteur", order: 1 },
        { groupLabel: "Socioculturel", verdict: "Favorable", order: 2 },
        { groupLabel: "Technologique", verdict: "Moteur", order: 3 },
        { groupLabel: "Écologique", verdict: "Latent", order: 4 },
        { groupLabel: "Légal", verdict: "Vigilance", order: 5 },
      ] },
    },
  });
  await prisma.analysis.create({
    data: {
      type: "PORTER", title: "Marché", order: 2,
      items: { create: [
        { groupLabel: "Rivalité", verdict: "Élevée", order: 0 },
        { groupLabel: "Pouvoir clients", verdict: "Fort", order: 1 },
        { groupLabel: "Nouveaux entrants", verdict: "Moyen", order: 2 },
        { groupLabel: "Substituts", verdict: "Moyen", order: 3 },
        { groupLabel: "Fournisseurs", verdict: "Faible", order: 4 },
      ] },
    },
  });

  // 10. Un projet « étude de cas » (jeu) avec blocs modulaires
  await prisma.project.create({
    data: {
      title: "Domestic Revolt", slug: "domestic-revolt",
      summary: "Conçu, piloté et déployé. Du problème à la mise en production.",
      content: "Étude de cas complète gérée par blocs modulaires.",
      featured: true, status: "PUBLISHED", order: 0,
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

  // 11. Témoignages — 1 validé (affiché) + 1 en attente de modération
  await prisma.testimonial.createMany({
    data: [
      {
        authorName: "Une cliente PME", authorRole: "Dirigeante",
        content: "Yohan a transformé notre idée en produit livré, du cadrage à la prod. Rare et précieux.",
        submittedContent: "Yohan a transformé notre idée en produit livré, du cadrage à la prod. Rare et précieux.",
        rating: 5, status: "APPROVED", isFeatured: true, order: 0, approvedAt: new Date(),
      },
      {
        authorName: "Ancien collègue", authorRole: "Lead Dev",
        content: "Vision produit + exécution technique, le tout en pilotant l'équipe. Bluffant.",
        submittedContent: "Vision produit + exécution technique, le tout en pilotant l'équipe. Bluffant.",
        status: "PENDING", order: 1,
      },
    ],
  });

  // Comptes de contrôle
  const [sec, hs, kpi, tr, goals, ana, proj, testi] = await Promise.all([
    prisma.siteSettings.count(), prisma.homeSection.count(), prisma.kpi.count(),
    prisma.careerTrack.count(), prisma.careerGoal.count(), prisma.analysis.count(),
    prisma.project.count(), prisma.testimonial.count(),
  ]);
  console.log(`Seed contenu OK → settings:${sec} sections:${hs} kpi:${kpi} tracks:${tr} goals:${goals} analyses:${ana} projets:${proj} testimonials:${testi}`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed contenu échoué:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
