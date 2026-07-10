package com.licitacalendario.service;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Service
public class DiasUteisServico {

    public LocalDate calcularPascoa(int ano) {
        int a = ano % 19;
        int b = ano / 100;
        int c = ano % 100;
        int d = b / 4;
        int e = b % 4;
        int f = (b + 8) / 25;
        int g = (b - f + 1) / 3;
        int h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4;
        int k = c % 4;
        int l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int mes = (h + l - 7 * m + 114) / 31;
        int dia = ((h + l - 7 * m + 114) % 31) + 1;
        return LocalDate.of(ano, mes, dia);
    }

    public Set<LocalDate> feriadosNacionais(int ano) {
        Set<LocalDate> feriados = new HashSet<>();
        feriados.add(LocalDate.of(ano, 1, 1));
        feriados.add(LocalDate.of(ano, 4, 21));
        feriados.add(LocalDate.of(ano, 5, 1));
        feriados.add(LocalDate.of(ano, 9, 7));
        feriados.add(LocalDate.of(ano, 10, 12));
        feriados.add(LocalDate.of(ano, 11, 2));
        feriados.add(LocalDate.of(ano, 11, 15));
        feriados.add(LocalDate.of(ano, 12, 25));
        if (ano >= 2024) {
            feriados.add(LocalDate.of(ano, 11, 20));
        }

        LocalDate pascoa = calcularPascoa(ano);
        feriados.add(pascoa.minusDays(48));
        feriados.add(pascoa.minusDays(47));
        feriados.add(pascoa.minusDays(2));
        feriados.add(pascoa.plusDays(60));

        return feriados;
    }

    public boolean isFeriado(LocalDate data) {
        return feriadosNacionais(data.getYear()).contains(data);
    }

    public boolean isDiaUtil(LocalDate data) {
        DayOfWeek dow = data.getDayOfWeek();
        return dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY && !isFeriado(data);
    }

    public LocalDateTime subtrairDiasUteis(LocalDateTime referencia, int dias) {
        LocalDate data = referencia.toLocalDate();
        int restantes = dias;
        while (restantes > 0) {
            data = data.minusDays(1);
            if (isDiaUtil(data)) restantes--;
        }
        return LocalDateTime.of(data, referencia.toLocalTime());
    }

    public LocalDateTime somarDiasUteis(LocalDateTime referencia, int dias) {
        LocalDate data = referencia.toLocalDate();
        int restantes = dias;
        while (restantes > 0) {
            data = data.plusDays(1);
            if (isDiaUtil(data)) restantes--;
        }
        return LocalDateTime.of(data, referencia.toLocalTime());
    }
}
