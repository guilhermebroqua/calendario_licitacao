package com.licitacalendario.model;

public enum TipoEtapa {
    RESUMO_EDITAL("Resumo e/ou análise do edital"),
    CADASTRO_SISTEMA("Cadastro ou atualização no sistema"),
    PREPARAR_DOCUMENTACAO("Preparar documentação"),
    PEDIDO_ESCLARECIMENTO_IMPUGNACAO("Pedido de esclarecimentos ou impugnação"),
    REGISTRAR_PROPOSTA_PRECOS("Registrar proposta de preços"),
    DEFINIR_VALOR_MINIMO_LANCE("Definir valor mínimo do lance"),
    DATA_ABERTURA_SESSAO("Data de abertura e realização da sessão"),
    SESSAO_LANCES_CHAT("Sessão de lances e acompanhamento de chat"),
    PROPOSTA_AJUSTADA_RECURSO("Proposta ajustada / habilitação / recurso administrativo");

    private final String label;

    TipoEtapa(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
