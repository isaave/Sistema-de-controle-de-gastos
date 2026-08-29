// nosso banco de dados fake kkk um array q vai guardar as coisas
let transacoes = [];

// pegando os id do html pra mexer pelo js
const Formulario = document.getElementById('Formulario');
const Lista = document.getElementById('Lista');
const TotalPagar = document.getElementById('Pagar');
const TotalReceber = document.getElementById('Recebido');
const totalRestante = document.getElementById('Restante');
const campoBusca = document.getElementById('campoBusca');

// funçao p/ arrumar o numero pra format de dinheiro tipo R$ 10,00
const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

// adicionar transacao
Formulario.addEventListener('submit', function(event) {
    event.preventDefault(); // nao deixa a pagina recarregar do nada

    // pegando os valor que eu digitei la no form
    const Descricao = document.getElementById('Descricao').value;
    const quantia = parseFloat(document.getElementById('quantia').value); 
    const type = document.querySelector('input[name="type"]:checked').value; 

    // monta a transacao
    const novaTransacao = {
        id: Date.now(), // gera um id com a data q criei
        Descricao,
        quantia,
        type
    };

    // uso o spread (...) aq pq em vez de dar .push() (q suja/muda o array original), 
    // ele cria um array novo juntando o q tinha antes com o item novo. 
    // decidi fazer assim pra manter a imutabilidade e evitar bug de estado
    transacoes = [...transacoes, novaTransacao];

    atualizarInterface();
    Formulario.reset(); // limpa o form pra add o proximo
});

// apagar as parada
function excluirTransacao(id) {
    // uso o filter pq e o jeito mais facil de remover algo. 
    // ele varre a lista e me devolve um array novo so com as coisas q passarem no teste.
    // o teste aq e: so fica quem tiver o id diferente do q eu cliquei pra excluir
    transacoes = transacoes.filter(t => t.id !== id);
    
    atualizarInterface(); 
}

// editar
function editarTransacao(id) {
    const transacao = transacoes.find(t => t.id === id);
    
    if (transacao) {
        // joga os dado de volta pro input p mim alterar
        document.getElementById('Descricao').value = transacao.Descricao;
        document.getElementById('quantia').value = transacao.quantia;
        document.querySelector(`input[name="type"][value="${transacao.type}"]`).checked = true;
        
        // apaga o antigo senao vai duplicar qnd eu clicar pra salvar dnv
        excluirTransacao(id);
    }
}

// atualiza a tela toda 
function atualizarInterface() {
    const termoBusca = campoBusca ? campoBusca.value.toLowerCase() : '';

    // usa o filter pra barra de pesquisa. ver se oq eu digitei ta no nome da transacao
    const transacoesFiltradas = transacoes.filter(t => 
        t.Descricao.toLowerCase().includes(termoBusca)
    );

    // uso o map aq pq ele e perfeito pra renderizar lista na tela.
    // ele pega cada objeto do meu array e transforma direto numa string html (no caso, a <tr> da tabela).
    // o .join('') no final junta todos esses pedacos num texto so pra jogar no innerHTML
    Lista.innerHTML = transacoesFiltradas.map(t => `
        <tr>
            <td>${t.Descricao}</td>
            <td style="color: ${t.type === 'entrada' ? '#10b981' : '#e11d48'}; font-weight: 500;">
                ${t.type === 'entrada' ? '+' : '-'} ${formatarMoeda(t.quantia)}
            </td>
            <td style="text-transform: capitalize;">${t.type}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editarTransacao(${t.id})">Editar</button>
                <button class="btn-action btn-delete" onclick="excluirTransacao(${t.id})">Excluir</button>
            </td>
        </tr>
    `).join('');

    // escolhi encadear filter com reduce pq fica bem mais limpo q fazer um 'for' gigante.
    // primeiro o filter separa so o q e entrada. dps o reduce ja vem somando tudo no 'acc' (acumulador q inicia em 0)
    const entradas = transacoes
        .filter(t => t.type === 'entrada')
        .reduce((acc, t) => acc + t.quantia, 0);

    // msm coisa p as saida
    const saidas = transacoes
        .filter(t => t.type === 'saida')
        .reduce((acc, t) => acc + t.quantia, 0);

    // matematica basica ne kkk
    const saldo = entradas - saidas;

    // joga os total formatado la pros card de cima
    TotalReceber.innerText = formatarMoeda(entradas);
    TotalPagar.innerText = formatarMoeda(saidas);
    totalRestante.innerText = formatarMoeda(saldo);
}

// escuta qnd eu digito na pesquisa p ir atualizando a tabela na msm hora
if (campoBusca) {
    campoBusca.addEventListener('input', atualizarInterface);
}