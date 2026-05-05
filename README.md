# Cogelas — Site web

Site institutionnel de Cogelas, entreprise de construction et rénovation
en Île-de-France. Présentation des expertises (planchers techniques,
revêtement de sol, terrassement, maçonnerie, isolation thermique),
réalisations, page contact avec formulaire, et pages légales.

Production : <https://cogelas.fr>

## Stack

HTML / CSS / JavaScript vanilla. Pas de build step, pas de framework.
Polices Google Fonts (Montserrat, Archivo, Archivo Black, Archivo Narrow).
Médias hébergés sur AWS CloudFront (`d3scdyhm3l4ak2.cloudfront.net`)
au-dessus d'un bucket S3 privé `cogelas-assets`.

## Structure du repo

```
Cogelas-frontend/
  index.html                       Page d'accueil (V4 — Red Corporate)
  qui-sommes-nous.html             Présentation entreprise (design Atelier)
  realisations.html                Grille des projets
  contact.html                     Formulaire + carte
  planchers-techniques.html        Expertise — planchers surélevés
  revetement-de-sol.html           Expertise — revêtement
  terrassement.html                Expertise — terrassement
  maconnerie.html                  Expertise — gros œuvre
  isolation-thermique.html         Expertise — ITE
  chevilly-la-rue.html             Détail projet (130 logements)
  mentions-legales.html            Mentions légales
  politique-de-confidentialite.html
  style.css                        Feuille de style globale
  script.js                        Header sticky, dropdown, mobile menu, form
  media/                           Logos, favicons, photos client
  api/                             Endpoint contact form
```

## Développement local

```bash
cd Cogelas-frontend
python -m http.server 8765
```

Puis ouvrir <http://localhost:8765/>.

## Déploiement

Déploiement Vercel (pending). Le domaine `cogelas.fr` est géré chez IONOS
avec des boîtes mail `info@` et `y.ozbek@` — conserver les enregistrements
MX lors du basculement DNS.

## Licence

© 2026 Cogelas. Tous droits réservés. Voir [`LICENSE`](LICENSE).
