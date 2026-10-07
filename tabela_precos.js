const TABELA_PRECOS = {
  "tabela_precos": {
    "tipo_venda": "Atacado",
    "descricao_geral": "Preços de atacado para camisetas do catálogo",
    "categorias": [
      {
        "nome": "Sem Strass",
        "itens": [
          {
            "produto": "Camiseta branca - Sublimação religiosa",
            "publico": "Adulto",
            "tamanhos": "P ao GG",
            "preco": 12.80
          },
          {
            "produto": "Camiseta Machão - Sublimação religiosa",
            "publico": "Adulto",
            "tamanhos": "P ao GG",
            "preco": 12.80
          },
          {
            "produto": "Camiseta branca - Sublimação religiosa",
            "publico": "Infantil",
            "tamanhos": "P ao GG",
            "preco": 8.10
          }
        ]
      },
      {
        "nome": "Com Strass",
        "itens": [
          {
            "produto": "Camiseta branca - Sublimação religiosa",
            "publico": "Infantil",
            "tamanhos": "P ao GG",
            "preco": 9.70
          }
        ]
      },
      {
        "nome": "Frente Total",
        "itens": [
          {
            "produto": "Camiseta com costas branca",
            "publico": "Adulto",
            "tamanhos": "P ao GG",
            "preco": 24.50
          }
        ]
      },
      {
        "nome": "Viscolycra Infantil Frente Inteira",
        "itens": [
          {
            "produto": "Viscolycra frente inteira - Com Strass",
            "publico": "Infantil",
            "tamanhos": "Não especificado",
            "preco": 14.50
          },
          {
            "produto": "Viscolycra frente inteira - Sem Strass",
            "publico": "Infantil",
            "tamanhos": "Não especificado",
            "preco": 13.00
          }
        ]
      },
      {
        "nome": "Silk camisas coloridas",
        "itens": [
          {
            "produto": "Camiseta Silk Colorida",
            "publico": "Adulto",
            "tamanhos": "P ao GG",
            "preco": 13.50
          },
          {
            "produto": "Camiseta Silk Colorida",
            "publico": "Infantil",
            "tamanhos": "P ao GG",
            "preco": 9.90
          },
          {
            "produto": "Baby Look Viscolycra Silk Colorida",
            "publico": "Adulto/Baby Look",
            "tamanhos": "P ao GG",
            "preco": 19.80
          }
        ]
      },
      {
        "nome": "Selo Camiseta ou Baby ViscoLycra coloridas",
        "itens": [
          {
            "produto": "Selo Camiseta ou Baby ViscoLycra",
            "publico": "Adulto",
            "tamanhos": "P ao GG",
            "preco": 22.40
          },
          {
            "produto": "Selo Baby Look Viscolycra",
            "publico": "Infantil",
            "tamanhos": "P ao GG",
            "preco": 14.60
          },
          {
            "produto": "Selo Camiseta",
            "publico": "Infantil",
            "tamanhos": "P ao GG",
            "preco": 14.00
          }
        ]
      },
      {
        "nome": "Body Estampado",
        "itens": [
          {
            "produto": "Body Estampado",
            "publico": "Unissex/Geral",
            "tamanhos": "P ao GG",
            "preco": 12.00
          }
        ]
      },
      {
        "nome": "BabyLook Frente total",
        "itens": [
          {
            "produto": "BabyLook Frente total",
            "publico": "Adulto",
            "tamanhos": "P ao XG",
            "preco": 22.90
          }
        ]
      },
      {
        "nome": "Camiseta DTF",
        "itens": [
          {
            "produto": "Camiseta Poliéster DTF",
            "publico": "Adulto",
            "tamanhos": "Não especificado",
            "preco": 15.00
          },
          {
            "produto": "Camiseta Machão DTF",
            "publico": "Adulto",
            "tamanhos": "Não especificado",
            "preco": 15.00
          },
          {
            "produto": "Camiseta Poliéster DTF",
            "publico": "Infantil",
            "tamanhos": "Não especificado",
            "preco": 9.50
          },
          {
            "produto": "Baby Look Viscolycra DTF",
            "publico": "Adulto",
            "tamanhos": "Não especificado",
            "preco": 19.00
          }
        ]
      }
    ]
  }
};

function formatMoney(value) {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getItemUnitPrice(item) {
    if (!item) return 0;
    const cat = item.category || '';
    const variant = item.variant || '';
    const dtfModel = item.dtfModel || '';
    const silkModel = item.silkModel || '';
    const infantilSeloModel = item.infantilSeloModel || item.model || '';

    // 1. Sublimação Adulto
    if (cat.includes('Sublimação Adulta') || cat.includes('Sublimação Adulto') || cat.includes('SublimacaoAdulto')) {
        return 12.80;
    }

    // 2. Sublimação Infantil
    if (cat.includes('Sublimação Infantil') || cat.includes('SublimacaoInfantil')) {
        if (variant === 'Com Pedrinha' || variant.toLowerCase().includes('com pedrinha') || variant.toLowerCase().includes('strass')) {
            return 9.70;
        }
        return 8.10;
    }

    // 3. Frente Total BabyLook (antiga "Baby Look")
    if (cat === 'Baby Look' || cat === 'Frente Total BabyLook' || cat.includes('BabyLook Frente total')) {
        return 22.90;
    }

    // 4. Frente Total Camiseta (antiga "Frente Total")
    if (cat === 'Frente Total' || cat === 'Frente Total Camiseta') {
        return 24.50;
    }

    // 5. Frente Total Infantil (antiga "Infantil")
    if (cat === 'Infantil' || cat === 'Frente Total Infantil') {
        if (variant === 'Com Pedrinha' || variant.toLowerCase().includes('com pedrinha') || variant.toLowerCase().includes('strass')) {
            return 14.50;
        }
        return 13.00;
    }

    // 6. Silkscreen
    if (cat === 'Silkscreen') {
        if (silkModel === 'Infantil') {
            return 9.90;
        }
        if (silkModel === 'Baby Viscolycra' || silkModel.includes('Baby')) {
            return 19.80;
        }
        return 13.50;
    }

    // 7. Adulto Selo (antiga Baby Look Selo - Selo Camiseta ou Baby ViscoLycra coloridas - Adulto)
    if (cat === 'Adulto Selo' || cat === 'Baby Look Selo') {
        return 22.40;
    }

    // 8. Infantil Selo (antiga "Visco Infantil Selo")
    if (cat.includes('Infantil Selo') || cat.includes('Visco Infantil Selo') || cat.includes('Viscolycra Selo Infantil')) {
        if (infantilSeloModel === 'Camiseta') {
            return 14.00;
        }
        return 14.60;
    }

    // 9. Body (Body Estampado)
    if (cat.includes('Body')) {
        return 12.00;
    }

    // 10. DTF Adulto
    if (cat === 'DTF ADULTO' || cat === 'DTF Adulto') {
        if (dtfModel === 'BabyLook Viscolycra') {
            return 19.00;
        }
        return 15.00;
    }

    // 11. DTF Infantil
    if (cat === 'DTF Infantil') {
        if (dtfModel.includes('Baby')) {
            return 19.00;
        }
        return 9.50;
    }

    // Fallbacks inteligentes baseados em palavras-chave
    const catLower = cat.toLowerCase();
    if (catLower.includes('body')) return 12.00;
    if (catLower.includes('adulto selo') || (catLower.includes('selo') && catLower.includes('adulto'))) return 22.40;
    if (catLower.includes('babylook') || catLower.includes('baby look')) {
        if (catLower.includes('selo')) return 22.40;
        return 22.90;
    }
    if (catLower.includes('frente total infantil')) return variant.includes('Pedrinha') ? 14.50 : 13.00;
    if (catLower.includes('frente total camiseta') || catLower === 'frente total') return 24.50;
    if (catLower.includes('infantil selo') || (catLower.includes('visco') && catLower.includes('infantil'))) {
        if (infantilSeloModel === 'Camiseta') {
            return 14.00;
        }
        return 14.60;
    }
    if (catLower.includes('silk')) {
        if (silkModel === 'Infantil') return 9.90;
        if (silkModel.includes('Baby')) return 19.80;
        return 13.50;
    }
    if (catLower.includes('dtf')) return catLower.includes('infantil') ? 9.50 : 15.00;
    if (catLower.includes('infantil')) return variant.includes('Pedrinha') ? 9.70 : 8.10;

    return 12.80; // Padrão
}
