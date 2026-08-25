import re

filtros_code = '''const FILTROS_CATEGORIAS = {
    "Baby Look": {
        "Nossa Senhora Aparecida": ["BBLK001", "BBLK002", "BBLK003", "BBLK004", "BBLK005", "BBLK008", "BBLK009", "BBLK010", "BBLK011", "BBLK012", "BBLK013", "BBLK014", "BBLK015", "BBLK016", "BBLK017", "BBLK018", "BBLK020", "BBLK021", "BBLK022", "BBLK023", "BBLK024", "BBLK025", "BBLK026", "BBLK027", "BBLK028", "BBLK040", "BBLK043", "BBLK044", "BBLK045", "BBLK046"],
        "São Miguel": ["BBLK007", "BBLK029"],
        "Nossa Senhora das Graças": ["BBLK019", "BBLK035", "BBLK037"],
        "Nossa Senhora de Fátima": ["BBLK006", "BBLK030", "BBLK032", "BBLK038"],
        "São Bento": ["BBLK031", "BBLK036"],
        "Nossa Senhora de Guadalupe": ["BBLK033", "BBLK039"],
        "Sagrada Família": ["BBLK034"],
        "Santíssimo": ["BBLK042"],
        "São José": ["BBLK041"]
    },
    "Body": {
        "Nossa Senhora Aparecida": ["0002", "0003", "0005", "0006", "0007", "0020", "0021", "0023", "0024", "0029", "0031", "0032", "0033"],
        "Anjinhos": ["0001", "0004", "0008", "0009", "0018", "0019", "0022", "0025", "0026", "0027", "0028", "0030"],
        "Futebol": ["0037", "0038", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0046", "0047", "0048"],
        "Desenhos": ["0034", "0035", "0036"],
        "Fé": ["0010", "0011", "0012", "0013", "0014", "0015", "0016", "0017"]
    },
    "Frente Total": {
        "Nossa Senhora Aparecida": ["FT001", "FT002", "FT003", "FT004", "FT005", "FT010", "FT034", "FT037", "FT038", "FT043", "FT044", "FT045", "FT046", "FT061", "FT071", "FT073", "FT075", "FT076", "FT077", "FT078"],
        "Nossa Senhora de Fátima": ["FT006", "FT021", "FT022", "FT023", "FT024", "FT067"],
        "São Bento": ["FT007", "FT011", "FT012", "FT049", "FT057"],
        "Cristo": ["FT008", "FT009", "FT013", "FT014", "FT015", "FT026", "FT027", "FT040", "FT041", "FT051"],
        "Nossa Senhora das Graças": ["FT029", "FT048", "FT059", "FT068", "FT069", "FT070"],
        "São Miguel": ["FT031", "FT032", "FT042"],
        "São Jorge": ["FT025", "FT035", "FT036", "FT056"],
        "Outros": ["FT016", "FT017", "FT018", "FT019", "FT020", "FT028", "FT030", "FT033", "FT039", "FT047", "FT050", "FT052", "FT053", "FT054", "FT055", "FT058", "FT060", "FT062", "FT063", "FT064", "FT065", "FT066", "FT072", "FT074"]
    },
    "Infantil": {
        "Nossa Senhora Aparecida": ["FTI-005", "FTI-006", "FTI-007", "FTI-010", "FTI-012", "FTI-016", "FTI-018", "FTI-022", "FTI-023", "FTI-024", "FTI-025", "FTI-026", "FTI-027"],
        "Anjinhos": ["FTI-001", "FTI-002", "FTI-003", "FTI-004", "FTI-008", "FTI-009"],
        "Cristo": ["FTI-013", "FTI-014", "FTI-015"],
        "São Bento": ["FTI-021"],
        "São Miguel": ["FTI-019"],
        "Outros": ["FTI-011", "FTI-017", "FTI-020"]
    },
    "Visco Infantil Selo": {
        "Nossa Senhora Aparecida": ["SI-001", "SI-002", "SI-004", "SI-005", "SI-007", "SI-008", "SI-009"],
        "Anjinhos": ["SI-003", "SI-006"],
        "Outros": ["SI-010"]
    },
    "Baby Look Selo": {
        "Nossa Senhora Aparecida": ["0001", "0002", "0006", "0007", "0009", "0013", "0014", "0016", "0017", "0018", "0023", "0024", "0025", "0027", "0029", "0031", "0035", "0037", "0039", "0040", "0041", "0042", "0043", "0044", "0045", "0050", "0051", "0056", "0057", "0059", "0062", "0063"],
        "São Bento": ["0005", "0008", "0046", "0058"],
        "Nossa Senhora de Fátima": ["0055"],
        "Nossa Senhora das Graças": ["0015", "0053", "0054"],
        "São Miguel": ["0019", "0047"],
        "Cristo": ["0004", "0012", "0033", "0061"],
        "Outros": ["0003", "0010", "0011", "0020", "0021", "0022", "0026", "0028", "0030", "0032", "0034", "0036", "0038", "0048", "0049", "0052", "0060", "0064"]
    },
    "Sublimação Infantil": {
        "Nossa Senhora Aparecida": ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012", "0013", "0014", "0015", "0016", "0023", "0024", "0029", "0030", "0031", "0032", "0035", "0036", "0037", "0038", "0039", "0040", "0041", "0042", "0044", "0045", "0046", "0047", "0048", "0051", "0052", "0054", "0055", "0056", "0059", "0060", "0062", "0063", "0066"],
        "Anjinhos": ["0017", "0018", "0019", "0020", "0025", "0026", "0027", "0028", "0043", "0049", "0050", "0064", "0065", "0067", "0068"],
        "São Bento": ["0061"],
        "Outros": ["0021", "0022", "0033", "0034", "0053", "0057", "0058", "0069", "0070", "0071", "0072", "0073", "0074", "0075", "0076"]
    },
    "Silkscreen": {
        "Nossa Senhora Aparecida": ["0001", "0005", "0006", "0013", "0014", "0019", "0023", "0024", "0026", "0028", "0032", "0033", "0034", "0035", "0038", "0039", "0045", "0047", "0048", "test_animado_0001"],
        "São Bento": ["0003", "0008", "0018", "0037", "0066", "0067"],
        "São Miguel": ["0015"],
        "São Jorge": ["0022", "0059", "0060"],
        "Nossa Senhora das Graças": ["0044", "0052"],
        "Cristo": ["0043", "0046", "0055", "0056", "0061", "0062", "0063", "0064", "0068", "0072", "0073", "0075", "0076"],
        "Outros": ["0002", "0004", "0007", "0009", "0010", "0011", "0012", "0016", "0017", "0020", "0021", "0025", "0027", "0029", "0030", "0031", "0036", "0040", "0041", "0042", "0049", "0050", "0051", "0053", "0054", "0057", "0058", "0065", "0069", "0070", "0071", "0074", "0077"]
    }
};'''

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(r'const FILTROS_CATEGORIAS = \{.*?\};', filtros_code, content, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Atualizado:', path)

update_file(r'D:\backup gabriel\Microsite Pedidos\script.js')
update_file(r'D:\backup gabriel\Mostruario Digital\catalogo.js')
