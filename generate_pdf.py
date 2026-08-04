import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Draw header
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 800, 555, 800)
        self.drawString(40, 806, "🎴 Fábrica de Cartas — Manual do Usuário e Guia de Testes")
        
        # Draw footer
        self.line(40, 45, 555, 45)
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(555, 30, page_text)
        self.drawString(40, 30, "https://github.com/lucas-tassis/FabricaDeCartas")
        self.restoreState()

def create_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#4F46E5"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F1F5F9"),
        borderColor=colors.HexColor("#CBD5E1"),
        borderWidth=0.5,
        borderPadding=3,
        spaceAfter=4
    )

    story = []

    # Title Banner
    story.append(Paragraph("🎴 Fábrica de Cartas", title_style))
    story.append(Paragraph("Manual Completo do Usuário & Guia de Testes para Amigos", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366F1"), spaceAfter=15))

    # Intro Section
    story.append(Paragraph("1. O que é a Fábrica de Cartas?", h2_style))
    intro_text = (
        "A <b>Fábrica de Cartas</b> é uma ferramenta web desenvolvida para criação e geração em massa de "
        "cartas personalizadas para jogos de tabuleiro (board games), card games e protótipos rápidos. "
        "Ela combina os dados de uma planilha Excel com um editor visual interativo na web."
    )
    story.append(Paragraph(intro_text, body_style))

    # Online Access Box
    story.append(Spacer(1, 6))
    online_data = [
        [Paragraph("<b>🚀 Como Acessar a Aplicação Online:</b>", ParagraphStyle('W', parent=body_style, textColor=colors.HexColor("#1E1B4B"), fontName="Helvetica-Bold")), ""],
        [Paragraph("Acesse no navegador: <font color='#4F46E5'><u>https://fabricadecartas.onrender.com</u></font>", body_style), ""]
    ]
    online_table = Table(online_data, colWidths=[515])
    online_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EEF2FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#6366F1")),
        ('PADDING', (0,0), (-1,-1), 8),
        ('SPAN', (0,0), (1,0)),
        ('SPAN', (0,1), (1,1)),
    ]))
    story.append(online_table)
    story.append(Spacer(1, 10))

    # Section 2: Excel
    story.append(Paragraph("2. Preparando a Planilha Excel (.xlsx)", h2_style))
    story.append(Paragraph("Monte uma planilha simples no Excel contendo os atributos das suas cartas:", body_style))
    story.append(Paragraph("• <b>Linha 1 (Cabeçalhos):</b> Nomeie cada coluna (ex: <i>Nome, Tipo, Ataque, Foto, CorFundo</i>).", bullet_style))
    story.append(Paragraph("• <b>Linhas Seguintes:</b> Cada linha gerará uma carta individual no PDF final.", bullet_style))

    excel_table_data = [
        [Paragraph("<b>Nome</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
         Paragraph("<b>Tipo</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
         Paragraph("<b>Ataque</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
         Paragraph("<b>Foto</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
         Paragraph("<b>CorFundo</b>", ParagraphStyle('TH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold'))],
        [Paragraph("Dragão de Fogo", body_style), Paragraph("Monstro", body_style), Paragraph("8", body_style), Paragraph("dragao.jpg", body_style), Paragraph("#FF4444", body_style)],
        [Paragraph("Escudo Real", body_style), Paragraph("Item", body_style), Paragraph("0", body_style), Paragraph("escudo.png", body_style), Paragraph("#4488FF", body_style)],
        [Paragraph("Poção Solar", body_style), Paragraph("Magia", body_style), Paragraph("0", body_style), Paragraph("pocao.jpg", body_style), Paragraph("#FFCC00", body_style)],
    ]
    t_excel = Table(excel_table_data, colWidths=[110, 85, 60, 130, 130])
    t_excel.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E293B")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_excel)
    story.append(Spacer(1, 10))

    # Section 3: Passo a passo
    story.append(Paragraph("3. Passo a Passo do Editor Visual", h2_style))
    steps = [
        "<b>1. Faça o Upload:</b> No painel esquerdo, selecione seu arquivo <code>.xlsx</code>.",
        "<b>2. Defina as Dimensões:</b> No painel direito, ajuste a largura e altura em mm (ex: 63.5 x 88.9 mm para Padrão Poker).",
        "<b>3. Crie Seções no Canvas:</b> Selecione a área com o mouse no editor central, clique com o botão direito e escolha <i>'Criar Seção'</i>.",
        "<b>4. Vincule os Atributos:</b> Associe cada coluna do Excel a uma seção e defina seu tipo (Texto, Imagem, Cor ou Bordas).",
        "<b>5. Personalize os Estilos:</b> Altere fontes, tamanhos, cores, alinhamentos, rotação e ajustes de imagem (Smart Fit, Cover, Contain).",
        "<b>6. Gerar Cartas:</b> Escolha o formato <b>PDF</b> (pronto para impressão) ou <b>ZIP</b> (imagens individuais) e clique em <i>'Gerar Cartas'</i>."
    ]
    for s in steps:
        story.append(Paragraph(f"• {s}", bullet_style))

    story.append(Spacer(1, 8))

    # Callout Duplex
    callout_data = [
        [Paragraph("<b>💡 Dica Pro: Impressão Frente e Verso (Duplex Espelhado)</b>", ParagraphStyle('CT', parent=body_style, textColor=colors.HexColor("#15803D"), fontName="Helvetica-Bold"))],
        [Paragraph("Na aba <b>Verso da Carta</b> no painel direito, ative o modo <b>Duplex Espelhado</b>. Ao imprimir em papel folha dupla (ex: Couché 250g/m²), as frentes e os versos das cartas ficarão perfeitamente alinhados para o corte!", ParagraphStyle('CB', parent=body_style, textColor=colors.HexColor("#166534")))]
    ]
    t_callout = Table(callout_data, colWidths=[515])
    t_callout.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDF4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#22C55E")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_callout)
    story.append(Spacer(1, 10))

    # Section 4: Atalhos
    story.append(Paragraph("4. Atalhos Úteis no Editor", h2_style))
    shortcuts_data = [
        [Paragraph("<b>Ação</b>", ParagraphStyle('TH2', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')),
         Paragraph("<b>Atalho / Comando</b>", ParagraphStyle('TH2', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold'))],
        [Paragraph("Desfazer / Refazer", body_style), Paragraph("<code>Ctrl + Z</code> / <code>Ctrl + Y</code>", body_style)],
        [Paragraph("Mover pelo Canvas (Pan)", body_style), Paragraph("Segurar <code>Barra de Espaço</code> + Arrastar mouse", body_style)],
        [Paragraph("Zoom in / Zoom out", body_style), Paragraph("Roda do Mouse (Scroll)", body_style)],
        [Paragraph("Reordenar Camadas", body_style), Paragraph("Arraste as colunas para cima/baixo no painel esquerdo", body_style)],
    ]
    t_shortcuts = Table(shortcuts_data, colWidths=[200, 315])
    t_shortcuts.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E293B")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_shortcuts)

    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == '__main__':
    pdf_path = "D:\\eclipse-workspace\\FabricaDeCartas\\Manual_Fabrica_de_Cartas.pdf"
    create_pdf(pdf_path)
    print(f"PDF successfully created at: {pdf_path}")
