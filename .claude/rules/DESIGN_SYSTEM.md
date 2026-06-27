# DESIGN.md — Direction artistique (DA)

> DA de référence du portfolio, à appliquer sur **tout le site** (`web` + `admin`).
> Source : le CV HTML de Yohan (mise en page premium « éditorial sombre + or »).
> Style : raffiné, dense, précision « print », contraste sombre/clair avec un accent or unique.

## Typographie
- Police : **Inter** (poids 300 / 400 / 500 / 600 / 700 / 900).
- Titres de section : **uppercase + letter-spacing** large, taille modérée.
- Hiérarchie marquée par le poids (900 pour les nombres/titres forts, 400 pour le corps).
- Sections numérotées (ex. `01`, `02`) en accent or.

## Couleurs (tokens)
**Accent (signature)**
- `--accent` : `#F0A800` (or) — couleur signature, à utiliser avec parcimonie (bordures, titres, CTA).
- `--accent-strong` : `#C07800` (or foncé, hover/contraste).

**Surfaces sombres**
- `--dark-900` : `#111111` · `--dark-800` : `#1C1C1C` · `--dark-700` : `#232323`
- bordures sombres : `#272727`.

**Surfaces claires**
- `--paper` : `#F7F6F3` (fond « papier ») · `--card` : `#FFFFFF`
- bordures claires : `#E4E3DF` / `#EAEAE6` / `#EDECEA`.

**Texte**
- Sur clair : fort `#1A1A1A`, `#2D2D2D`, `#333` ; atténué `#555` / `#666`.
- Sur sombre : `#FFFFFF`, `#DDD` ; atténué `#999` / `#888` / `#777`.

**Badges de statut**
- en cours : `#E65100` (orange) · validé/clé : `#1A6B3C` (vert).

## Traits & composants
- **Pills / chips** : arrondis (radius ~20px), fond discret (`#232323` sur sombre / teinte or `rgba(240,168,0,0.1)`).
- **Tags techno** : teinte or `rgba(240,168,0,0.07)`, radius 3px, petit, poids 500.
- **Accent latéral** : bordure gauche or (`border-left: 2.5px #F0A800`) sur les items d'expérience/contenu.
- **Bandes d'accent** : liseré or vertical/horizontal en bord de bloc, dégradés subtils.
- **Stat cards** : fond sombre, grands nombres en or (poids 900).
- **Ombres** : douces et profondes pour détacher les blocs « papier » du fond.

## Application (quand on construira le site)
- Exposer ces tokens via le **thème Tailwind v4** (`@theme` / CSS variables) — pas de couleurs en dur dans les composants.
- Respecter l'accent or comme **couleur unique de mise en avant** (ne pas multiplier les couleurs vives).
- Conserver l'esprit éditorial : densité maîtrisée, typographie soignée, contrastes francs.

> Réf. visuelle complète : le CV HTML (`CV_Debusscher_Visuel_20.html`) — fidélité de mise en page à préserver sur la page CV.
