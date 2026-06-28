# P16 — Réseaux sociaux : auto-post & stats — PLAN ONLY (NON EXÉCUTÉ)

> **⚠️ Ce plan n'est PAS exécuté cette nuit** : non testable sans comptes réels
> + OAuth + secrets. Document de conception pour une phase ultérieure, **après
> validation des dépendances et de la posture sécurité** (stockage de tokens).
> Standards : `2026-06-28-CODE-STANDARDS.md`.

**Goal:** Publier automatiquement des posts multi-réseaux (texte **adapté par
réseau**), avec **choix où/quand** poster, et **statistiques de lecture** dans le BO.

**Architecture cible:** modèles DB pour comptes/posts/stats ; composition de texte
par réseau (assistée IA, P14) ; **planificateur** (cron) qui publie à l'heure
voulue via les APIs réseau ; **job de stats** qui rafraîchit les métriques.

---

## Modèles DB (à ajouter quand on lance la phase)

```prisma
enum SocialNetwork { LINKEDIN X INSTAGRAM FACEBOOK }
enum SocialPostStatus { DRAFT SCHEDULED POSTED FAILED }

model SocialAccount {
  id          String        @id @default(cuid())
  network     SocialNetwork
  handle      String
  displayName String?
  isConnected Boolean       @default(false)
  // SECRETS : tokens OAuth JAMAIS en clair → chiffrés (KMS/clé app) ou en secret
  // store externe. Table inaccessible à `app_web` (REVOKE).
  expiresAt   DateTime?
  createdAt   DateTime      @default(now())
  posts       SocialPost[]
  @@unique([network, handle])
}

model SocialPost {
  id             String           @id @default(cuid())
  network        SocialNetwork
  content        String           // texte adapté au réseau
  status         SocialPostStatus @default(DRAFT)
  scheduledAt    DateTime?        // QUAND
  postedAt       DateTime?
  externalId     String?          // id du post sur le réseau
  externalUrl    String?
  error          String?
  articleId      String?          // source éventuelle
  article        Article?         @relation(fields: [articleId], references: [id], onDelete: SetNull)
  accountId      String
  account        SocialAccount    @relation(fields: [accountId], references: [id], onDelete: Cascade)
  stats          SocialPostStat[]
  createdAt      DateTime         @default(now())
  @@index([status, scheduledAt])
}

model SocialPostStat {
  id          String   @id @default(cuid())
  postId      String
  post        SocialPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  impressions Int      @default(0)
  likes       Int      @default(0)
  comments    Int      @default(0)
  shares      Int      @default(0)
  clicks      Int      @default(0)
  fetchedAt   DateTime @default(now())
  @@index([postId, fetchedAt])
}
```

## Côté BO (phase ultérieure)
- Connexion des comptes (OAuth par réseau) — **secrets**.
- Composition d'un post par réseau (texte adapté, **assisté IA** via P14), choix
  des réseaux (où) + `scheduledAt` (quand).
- Tableau de bord des posts (DRAFT/programmés/publiés/échoués) + **stats**.

## Intégrations & dépendances (À VALIDER)
- **APIs/OAuth** : LinkedIn, X, Instagram/Facebook (apps développeur + tokens).
- **Planificateur** : cron/queue qui publie à `scheduledAt`.
- **Job stats** : polling périodique des métriques → `SocialPostStat`.
- **Sécurité** : tokens chiffrés / secret store ; table `SocialAccount`
  inaccessible à `app_web` ; rotation des tokens ; révocation.

## Décision requise avant exécution
1. Quels réseaux en priorité ? 2. Création des apps OAuth + secrets. 3. Vehicle
de planification (cron docker / service). 4. Politique de stockage des tokens.

> **Statut : conception validée, exécution en attente des dépendances ci-dessus.**
