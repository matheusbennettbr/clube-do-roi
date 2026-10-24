# Clube do ROI — Landing page

Landing page de captação para o **Clube do ROI**, um jantar exclusivo para empresários
(networking estratégico, inteligência artificial e novas fontes de receita).

## Identidade

Azul profundo com gradiente royal, cobre (`#D08C5E`) como acento, tipografia geométrica
(**Jost**) em caixa alta com tracking largo e **Inter** no corpo. Sem fotos: a atmosfera vem
de gradientes, fios de 1px e espaço negativo.

## Estrutura

```
index.html            página inteira (HTML + CSS + JS embutidos, ~45 KB)
img/logo-roi.webp     logo oficial com transparência
img/favicon.png       favicon (símbolo Ø da logo)
fonts/jost.woff2      fonte dos títulos (variable, subset latin)
fonts/inter.woff2     fonte do corpo (variable, subset latin)
og.jpg                imagem de compartilhamento (1200x630)
servidor-local.mjs    servidor estático para preview local
```

Nenhuma dependência externa em runtime — nada de CDN, Google Fonts ou bibliotecas.
Para publicar, basta enviar estes arquivos para a pasta pública do servidor.

## Preview local

```bash
node servidor-local.mjs      # http://localhost:5180
```

## Seções

1. **Hero** — headline, subheadline e CTA
2. **A virada de chave** — oportunidades dentro do que a empresa já tem
3. **A experiência** — 4 pilares (networking, novas receitas, IA/automação, mentalidade)
4. **O convite** — CTA final
5. **Lista de interessados** — formulário (nome, WhatsApp, e-mail, empresa)

## Formulário

O envio é tratado no `<script>` do final do `index.html`:

```js
var WEBHOOK_URL = '';   // ← destino dos leads
```

Enquanto estiver vazio, o formulário valida, guarda o lead em `localStorage` e mostra a tela
de sucesso — **sem enviar para lugar nenhum**. Preencher com a URL do webhook (CRM) para ativar.
O payload vai em JSON com `nome`, `email`, `whatsapp`, `empresa`, `origem`, `pagina`,
`enviado_em` e os UTMs capturados da URL (`utm_source`, `utm_medium`, `utm_campaign`,
`utm_content`, `utm_term`, `fbclid`, `gclid`).

## Acessibilidade e performance

- Fontes locais com `preload`, sem requisição externa
- `prefers-reduced-motion` respeitado (desliga reveals e brilhos)
- Modal com foco preso, fechamento por `Esc` e retorno de foco
- Responsivo de 320px a telas largas, sem rolagem horizontal
