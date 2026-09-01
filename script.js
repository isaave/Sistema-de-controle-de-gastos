// Array que representa nosso banco de dados temporario
let transacoes = [];

// pegando os dados pelo id do html
const Formulario = document.getElementById('Formulario');
const Lista = document.getElementById('Lista');
const TotalPagar = document.getElementById('Pagar');
const TotalReceber = document.getElementById('Recebido');
const totalRestante = document.getElementById('Restante');

// pegando os dados de interacoes do usuario dentro html pra poder chamar a funcao 
const campoBusca = document.getElementById('campoBusca');
const btnToggleFiltros = document.getElementById('btnToggleFiltros');
const painelFiltros = document.getElementById('painelFiltros');
const filtroCategoria = document.getElementById('filtroCategoria');
const filtroTipo = document.getElementById('filtroTipo');

// criando um arrow function  para tranforma o decimal em real
const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

// Funciona como um toggle que interage com os cliques do usuario para abrir e fechar menu de opcoes 
btnToggleFiltros.addEventListener('click', () => {
    if (painelFiltros.style.display === 'none') {
        painelFiltros.style.display = 'flex';
    } else {
        painelFiltros.style.display = 'none';
    }
});

// Adiciona um ouvinte para o envio do formulário de novas movimentações
Formulario.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o recarregamento automático da página

    const Descricao = document.getElementById('Descricao').value;
    const quantia = parseFloat(document.getElementById('quantia').value); 
    const type = document.querySelector('input[name="type"]:checked').value; 
    const Categoria = document.getElementById('Categoria').value;

    // Validação de segurança: impede cadastro com campos vazios ou valores inválidos/zerados
    if (Descricao.trim() === '' || isNaN(quantia) || quantia <= 0) {
        alert("Erro: Preencha a descrição e insira um valor maior que zero.");
        return; 
    }

// Cria o objeto da nova transação contendo um ID único por timestamp e os dados informados
    const novaTransacao = {
        id: Date.now(), 
        Descricao,
        quantia,
        type,
        Categoria
    };

    // Utiliza o Spread Operator (...) para garantir a imutabilidade do estado, gerando um array novo com o item adicionado
    //Pega todas as transações que já existiam e as "espalha" dentro do novo array, evita alterar o array original, ele cria uma copia nova add os novo 
    transacoes = [...transacoes, novaTransacao];

    // Atualiza a interface gráfica (tabela e cards de resumo) e limpa os campos do formulário
    atualizarInterface();
    Formulario.reset(); 
});

// Remove a transação do array utilizando o método .filter() para manter apenas os itens com ID diferente do selecionado
function excluirTransacao(id) {
    // Cria um novo array ignorando o item com o ID correspondente e atualiza a tela
    transacoes = transacoes.filter(t => t.id !== id);
    atualizarInterface(); 
}

// Localiza a transação que o usuário deseja editar pelo ID e preenche os campos do formulário com seus dados
function editarTransacao(id) {
    const transacao = transacoes.find(t => t.id === id);
    
    if (transacao) {
        // Devolve os valores salvos de volta para os inputs do formulário para alteração
        document.getElementById('Descricao').value = transacao.Descricao;
        document.getElementById('quantia').value = transacao.quantia;
        document.querySelector(`input[name="type"][value="${transacao.type}"]`).checked = true;
        document.getElementById('Categoria').value = transacao.Categoria;
        
        // Exclui o registro antigo para que, ao salvar novamente, ele seja substituído pela versão atualizada
        excluirTransacao(id);
    }
}

// Atualiza a tabela inteira e os cards de resumo com base nos filtros aplicados
function atualizarInterface() {
    const termoBusca = campoBusca.value.toLowerCase();
    const categoriaSelecionada = filtroCategoria.value;
    const tipoSelecionado = filtroTipo.value;

    // Filtro encadeado: junta texto da barra (descrição ou valor) + categoria do select + tipo do select[cite: 1]
    const transacoesFiltradas = transacoes.filter(t => {
        const passaBusca = t.Descricao.toLowerCase().includes(termoBusca) || t.quantia.toString().includes(termoBusca);
        const passaCategoria = categoriaSelecionada === 'todas' || t.Categoria === categoriaSelecionada;
        const passaTipo = tipoSelecionado === 'todos' || t.type === tipoSelecionado;

        return passaBusca && passaCategoria && passaTipo;
    });

  // O método .map() transforma cada objeto do array filtrado em uma linha de código HTML para a tabela
  //função nativa dos arrays em JavaScript que serve para percorrer todos os itens de um array e transformá-los, gerando um novo array com o mesmo número de elementos, mas com os dados modificados conforme você instruir.
    Lista.innerHTML = transacoesFiltradas.map(t => `
        <tr>
            <td>${t.Descricao}</td>
            <td>${t.Categoria}</td>
            <td style="color: ${t.type === 'entrada' ? '#10b981' : '#e11d48'}; font-weight: 500;">
                ${t.type === 'entrada' ? '+' : '-'} ${formatarMoeda(t.quantia)}
            </td>
            <td style="text-transform: capitalize;">${t.type}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editarTransacao(${t.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="excluirTransacao(${t.id})">Excluir</button>
            </td>
        </tr>
    `).join(''); // .join('') une todos os blocos HTML gerados em uma única string contínua

  // O método .reduce() percorre as transações filtradas para somar os valores totais de entradas e saídas
  // ou seja, função nativa do JavaScript usada para percorrer um array e reduzi-lo a um único valor final (que pode ser um número, uma string, um objeto ou até mesmo outro array).
  //Alem do .filter() é uma função nativa dos arrays em JavaScript que serve para filtrar os elementos de um array com base em uma condição, criando um novo array apenas com os itens que passam no teste (ou seja, aqueles que retornam true).
    const entradas = transacoesFiltradas
        .filter(t => t.type === 'entrada')
        .reduce((acc, t) => acc + t.quantia, 0);

    const saidas = transacoesFiltradas
        .filter(t => t.type === 'saida')
        .reduce((acc, t) => acc + t.quantia, 0);

    // Calcula o saldo restante subtraindo as saídas do total de entradas
    const saldo = entradas - saidas;

    // Atualiza os elementos visuais dos cards de resumo com os valores formatados em moeda
    TotalReceber.innerText = formatarMoeda(entradas);
    TotalPagar.innerText = formatarMoeda(saidas);
    totalRestante.innerText = formatarMoeda(saldo);
}

// Configura os ouvintes de eventos para disparar a atualização da interface sempre que o usuário digitar na busca ou alterar os filtros
campoBusca.addEventListener('input', atualizarInterface);
filtroCategoria.addEventListener('change', atualizarInterface);
filtroTipo.addEventListener('change', atualizarInterface);