function salvarEdicao() {
  alert("Alterações salvas com sucesso!");
  // Fechar modal
  var modal = bootstrap.Modal.getInstance(
    document.getElementById("editarSolicitacaoModal")
  );
  modal.hide();
}

function criarCardSolicitacao({
  solicitationId,
  professorName,
  utilizationDate,
  solicitationDate,
  laboratory,
  needInstalation,
  softwaresSolicited,
}) {
  const card = document.createElement("div");
  card.className = "col-lg-6 mb-4";
  card.innerHTML = `
    <div class="card solicitacao-card h-100">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="card-title">${professorName}</h5>
                     <p class="text-muted mb-2">
                        <i class="bi bi-calendar-event"></i> Solicitado em: ${solicitationDate}
                    </p>
                </div>
                
            </div>

            <hr>

            <div class="row">
                <div class="col-md-6">
                    <h6><i class="bi bi-calendar-check"></i> Data de Utilização:</h6>
                    <p>${utilizationDate}</p>

                    <h6><i class="bi bi-pc-display"></i> Laboratório:</h6>
                    <p>${laboratory}</p>
                </div>

                <div class="col-md-6">
                    <h6><i class="bi bi-collection"></i> Softwares solicitados:</h6>
                    <ul class="softwares-list">
                        ${softwaresSolicited
                          .map(
                            (software) => `
                            <li class="software-item">
                                <i class="bi bi-check-circle-fill text-warning me-2"></i>
                                <span>${software.softwareName}</span>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                    <h6><i class="bi bi-plugin"></i> Softwares a serem instalados:</h6>
                    <ul class="softwares-list">
                        ${needInstalation
                          .map(
                            (software) => `
                            <li class="software-item">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                <span>${software.softwareName}</span>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>

                </div>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-3">
                <button class="btn btn-success btn-acao" onclick="finalizarSolicitacao(${solicitationId})">
                    <i class="bi bi-check-circle"></i> Finalizar
                </button>
                <button 
                class="btn btn-primary btn-acao" 
                data-bs-toggle="modal" 
                data-bs-target="#editarSolicitacaoModal" 
                onclick="editarSolicitacao(${solicitationId});" >
                    <i class="bi bi-pencil"></i> Editar
                </button>
            </div>
        </div>
    </div>
`;

  document.getElementById("solicitacoesContainer").appendChild(card);
}

 async function carregarSolicitacoes() {
  try {
    const response = await fetch("http://localhost:8080/solicitation", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Erro ao buscar solicitações: ${response.status}`);
    }

    const solicitacoes = await response.json();

    solicitacoes.forEach((solicitacao) => {
      console.log("solicitacao:", solicitacao);
      if (solicitacao.executed == false) {
        criarCardSolicitacao({
          solicitationId: solicitacao.solicitationId,
          professorName: solicitacao.professorName,
          utilizationDate: solicitacao.utilizationDate,
          solicitationDate: solicitacao.solicitationDate,
          laboratory: solicitacao.laboratory,
          needInstalation: solicitacao.needInstalation,
          softwaresSolicited: solicitacao.softwaresSolicited,
        });
      }
    });
  } catch (erro) {
    console.error("Erro ao carregar as solicitações:", erro);
  }
}

carregarSolicitacoes();

let solicitacaoSelecionadaId = null;

async function editarSolicitacao(solicitationId) {
  solicitacaoSelecionadaId = solicitationId;
  try {
    const labsResponse = await fetch("http://localhost:8080/laboratory", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });

    if (!labsResponse.ok) {
      throw new Error(`Erro ao buscar laboratórios: ${labsResponse.status}`);
    }

    const laboratories = await labsResponse.json();
    console.log(laboratories);

    const select = document.getElementById("laboratorioEdit");
    select.innerHTML = "";

    laboratories.forEach((lab) => {
      const option = document.createElement("option");
      option.value = lab.laboratoryId;
      option.textContent = `${lab.laboratoryName}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar laboratórios:", error);
  }
}

async function salvarEdicao() {
  const laboratoryId = document.getElementById("laboratorioEdit").value;

  if (!solicitacaoSelecionadaId || !laboratoryId) {
    alert("Dados inválidos.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/solicitation/edit/${solicitacaoSelecionadaId}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(laboratoryId),
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao editar: ${response.status}`);
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editarSolicitacaoModal")
    );
    modal.hide();
    alert(
      "Alteração realizada com sucesso. Atualize a página para visualizar as mudanças!"
    );
  } catch (error) {
    console.error("Erro ao salvar edição:", error);
    alert("Erro ao editar solicitação.");
  }
}

async function finalizarSolicitacao(solicitacaoId) {
  if (!solicitacaoId) {
    alert("Solicitação inválida.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/solicitation/execute/${solicitacaoId}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao finalizar: ${response.status}`);
    }

    alert(
      "Solicitação finalizada com sucesso. Atualize a página para visualizar as mudanças!"
    );
  } catch (error) {
    console.error("Erro ao finalizar solicitação:", error);
    alert("Erro ao finalizar solicitação.");
  }
}
