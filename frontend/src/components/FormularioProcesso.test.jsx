import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FormularioProcesso from "./FormularioProcesso";

describe("FormularioProcesso", () => {
  test("exibe erros de validação quando campos obrigatórios estão vazios", async () => {
    const onSalvar = jest.fn();
    render(<FormularioProcesso onSalvar={onSalvar} onCancelar={jest.fn()} />);

    fireEvent.click(screen.getByText("Criar processo"));

    expect(await screen.findByText("O cliente/órgão é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("O número do processo é obrigatório")).toBeInTheDocument();
    expect(screen.getByText("A data de abertura é obrigatória")).toBeInTheDocument();
    expect(onSalvar).not.toHaveBeenCalled();
  });

  test("envia o DTO completo quando o formulário é válido", async () => {
    const onSalvar = jest.fn().mockResolvedValue({ id: 1, avisosMesmoDia: [] });
    render(<FormularioProcesso onSalvar={onSalvar} onCancelar={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/Prefeitura Municipal/), { target: { value: "Prefeitura X" } });
    fireEvent.change(screen.getByPlaceholderText(/PE 045/), { target: { value: "PE 045/2026" } });
    fireEvent.change(screen.getByLabelText(/Data e hora de abertura/), { target: { value: "2026-08-18T09:00" } });

    fireEvent.click(screen.getByText("Criar processo"));

    await waitFor(() => expect(onSalvar).toHaveBeenCalled());
    const dto = onSalvar.mock.calls[0][0];
    expect(dto.cliente).toBe("Prefeitura X");
    expect(dto.numeroProcesso).toBe("PE 045/2026");
    expect(dto.dataAbertura).toBe("2026-08-18T09:00:00");
    expect(dto.diasUteisDocumentacao).toBe(5);
  });

  test("exibe avisos de mesmo dia sem fechar o formulário", async () => {
    const onSalvar = jest.fn().mockResolvedValue({ id: 1, avisosMesmoDia: ["PE 099/2026 (Outro Órgão) também tem sessão em 18/08/2026"] });
    render(<FormularioProcesso onSalvar={onSalvar} onCancelar={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/Prefeitura Municipal/), { target: { value: "Prefeitura X" } });
    fireEvent.change(screen.getByPlaceholderText(/PE 045/), { target: { value: "PE 045/2026" } });
    fireEvent.change(screen.getByLabelText(/Data e hora de abertura/), { target: { value: "2026-08-18T09:00" } });
    fireEvent.click(screen.getByText("Criar processo"));

    expect(await screen.findByText(/também tem sessão em 18\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText("Continuar mesmo assim")).toBeInTheDocument();
  });

  test("botão cancelar dispara onCancelar", () => {
    const onCancelar = jest.fn();
    render(<FormularioProcesso onSalvar={jest.fn()} onCancelar={onCancelar} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancelar).toHaveBeenCalled();
  });
});
