package com.licitacalendario.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

import static org.assertj.core.api.Assertions.assertThat;

class DiasUteisServicoTest {

    private final DiasUteisServico servico = new DiasUteisServico();

    @Test
    @DisplayName("calcula a Páscoa corretamente para anos conhecidos")
    void deveCalcularPascoaCorretamente() {
        assertThat(servico.calcularPascoa(2026)).isEqualTo(LocalDate.of(2026, 4, 5));
        assertThat(servico.calcularPascoa(2025)).isEqualTo(LocalDate.of(2025, 4, 20));
        assertThat(servico.calcularPascoa(2024)).isEqualTo(LocalDate.of(2024, 3, 31));
    }

    @Test
    @DisplayName("reconhece feriados nacionais fixos")
    void deveReconhecerFeriadosFixos() {
        assertThat(servico.isFeriado(LocalDate.of(2026, 1, 1))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 4, 21))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 5, 1))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 9, 7))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 10, 12))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 11, 2))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 11, 15))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 11, 20))).isTrue();
        assertThat(servico.isFeriado(LocalDate.of(2026, 12, 25))).isTrue();
    }

    @Test
    @DisplayName("reconhece feriados móveis calculados a partir da Páscoa (2026)")
    void deveReconhecerFeriadosMoveis() {
        LocalDate pascoa2026 = LocalDate.of(2026, 4, 5);
        assertThat(servico.isFeriado(pascoa2026.minusDays(2))).as("Sexta-feira Santa").isTrue();
        assertThat(servico.isFeriado(pascoa2026.minusDays(48))).as("Carnaval segunda").isTrue();
        assertThat(servico.isFeriado(pascoa2026.minusDays(47))).as("Carnaval terça").isTrue();
        assertThat(servico.isFeriado(pascoa2026.plusDays(60))).as("Corpus Christi").isTrue();
    }

    @Test
    @DisplayName("não considera dia comum como feriado")
    void naoDeveConsiderarDiaComumComoFeriado() {
        assertThat(servico.isFeriado(LocalDate.of(2026, 7, 15))).isFalse();
    }

    @Test
    @DisplayName("fins de semana nunca são dia útil")
    void finalDeSemanaNuncaEhDiaUtil() {
        LocalDate sabado = LocalDate.of(2026, 7, 1).with(TemporalAdjusters.nextOrSame(DayOfWeek.SATURDAY));
        LocalDate domingo = sabado.plusDays(1);
        assertThat(servico.isDiaUtil(sabado)).isFalse();
        assertThat(servico.isDiaUtil(domingo)).isFalse();
    }

    @Test
    @DisplayName("feriado em dia de semana não é dia útil")
    void feriadoEmDiaDeSemanaNaoEhDiaUtil() {
        assertThat(servico.isDiaUtil(LocalDate.of(2026, 12, 25))).isFalse();
    }

    @Test
    @DisplayName("subtrai dias úteis pulando corretamente o final de semana")
    void deveSubtrairDiasUteisPulandoFimDeSemana() {
        LocalDate terca = escolherTercaSemFeriadosProximos();
        LocalDateTime referencia = terca.atTime(9, 0);

        LocalDateTime resultado = servico.subtrairDiasUteis(referencia, 3);

        assertThat(resultado).isEqualTo(terca.minusDays(5).atTime(9, 0));
    }

    @Test
    @DisplayName("soma dias úteis pulando corretamente o final de semana")
    void deveSomarDiasUteisPulandoFimDeSemana() {
        LocalDate quinta = escolherTercaSemFeriadosProximos().minusDays(5);
        LocalDateTime referencia = quinta.atTime(9, 0);

        LocalDateTime resultado = servico.somarDiasUteis(referencia, 3);

        assertThat(resultado).isEqualTo(quinta.plusDays(5).atTime(9, 0));
    }

    @Test
    @DisplayName("preserva o horário original ao calcular dias úteis")
    void devePreservarHorarioOriginal() {
        LocalDate segunda = LocalDate.of(2026, 7, 1).with(TemporalAdjusters.nextOrSame(DayOfWeek.MONDAY));
        LocalDateTime referencia = segunda.atTime(14, 30);

        LocalDateTime resultado = servico.subtrairDiasUteis(referencia, 1);

        assertThat(resultado.toLocalTime()).isEqualTo(java.time.LocalTime.of(14, 30));
    }

    private LocalDate escolherTercaSemFeriadosProximos() {
        LocalDate terca = LocalDate.of(2026, 7, 1).with(TemporalAdjusters.nextOrSame(DayOfWeek.TUESDAY));
        while (servico.isFeriado(terca) || servico.isFeriado(terca.minusDays(1))
                || servico.isFeriado(terca.minusDays(4)) || servico.isFeriado(terca.minusDays(5))) {
            terca = terca.plusWeeks(1);
        }
        return terca;
    }
}
