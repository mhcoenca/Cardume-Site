# Cardume - card-u.me

Este é o repositório do domínio card-u.me: a raiz é o Scryfall Studio (React/
Vite, `scryfall-studio/`), e a landing page + páginas de suporte (privacy,
safety, delete-account) do app Cardume vivem em `/app` como HTML/CSS/JS
puro.

- **Landing page (`/app`, `privacy/`, `safety/`, `delete-account/`, etc.):**
  HTML/CSS/JavaScript puro, sem frameworks nem build tools — tudo deve
  funcionar abrindo o HTML direto no browser. Foco em conversão: CTAs para
  App Store e Google Play são o objetivo principal.
- **Scryfall Studio (`scryfall-studio/`):** app React/TypeScript/Vite com
  build step próprio — Cloudflare Pages roda `npm run build` dentro dessa
  pasta e copia o `dist/` pra raiz do deploy. "Sem build tools" acima só
  vale pra landing page, não pro repo inteiro.
- **Hospedagem:** Cloudflare Pages, deploy automático a partir do `main`.

Ao trabalhar aqui, lembre-se:
- Manter design responsivo (mobile-first, testar em telas pequenas) em
  qualquer uma das duas partes
- Não introduzir build steps na landing page em `/app`
- `.well-known/*`, `_redirects`, `_headers` e o redirect de `/pedido/*`
  (deep link de compartilhamento de pedido) são compartilhados pela raiz
  do domínio — não mexer sem entender o impacto nos dois lados
