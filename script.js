    document.addEventListener('DOMContentLoaded', () => {

    // ========================
    // Seletores de Elementos do DOM
    // ========================
    const mainContent = document.querySelector('.main-content');
    const cartIcon = document.getElementById('cart-icon');
    const cartCounter = document.getElementById('cart-counter');
    const orderItemsContainer = document.getElementById('order-items');
    const totalValueSpan = document.getElementById('total-value');
    const sendOrderButton = document.getElementById('btn-send-order');
    const orderSummarySection = document.getElementById('order-summary-section');
    const obsTextarea = document.getElementById('obs');
    
    const paymentOptions = document.querySelectorAll('input[name="pagamento"]');
    const trocoSecao = document.getElementById('troco-secao');
    const pixSecao = document.getElementById('pix-secao');
    const trocoInput = document.getElementById('troco-para');
    const qrcodeContainer = document.getElementById('qrcode');
    const pixKeyInput = document.getElementById('pix-key-copy');
    const copyPixBtn = document.getElementById('copy-pix-btn');

    // ========================
    // Configuração
    // ========================
    // !!! IMPORTANTE: SUBSTITUA PELA SUA CHAVE PIX REAL !!!
    const SUA_CHAVE_PIX = "anderson.8691@gmail.com"; // Pode ser CPF, CNPJ, e-mail, telefone ou chave aleatória

    // ========================
    // Estado da Aplicação (Carrinho)
    // ========================
    let cart = [];

    // ========================
    // Lógica de Eventos (Event Listeners)
    // ========================
    mainContent.addEventListener('click', handleMainContentClick);
    sendOrderButton.addEventListener('click', sendOrder);
    cartIcon.addEventListener('click', () => orderSummarySection.scrollIntoView({ behavior: 'smooth' }));
    paymentOptions.forEach(option => option.addEventListener('change', handlePaymentChange));
    copyPixBtn.addEventListener('click', copyPixKey);

    handlePaymentChange();

    // ========================
    // Funções de Eventos
    // ========================
    function handleMainContentClick(event) {
        if (event.target.classList.contains('js-add-to-cart')) {
        const button = event.target;
        const itemName = button.dataset.nome;
        const itemPrice = parseFloat(button.dataset.preco);
        addToCart(itemName, itemPrice);
        }
    }

    function handlePaymentChange() {
        const selectedPayment = document.querySelector('input[name="pagamento"]:checked').value;

        trocoSecao.classList.toggle('hidden', selectedPayment !== 'Dinheiro');
        pixSecao.classList.toggle('hidden', selectedPayment !== 'Pix');

        if (selectedPayment === 'Pix' && qrcodeContainer.children.length === 0) {
        generateQRCode(SUA_CHAVE_PIX);
        }
    }

    function copyPixKey() {
        pixKeyInput.select();
        document.execCommand('copy');
        showNotification('✅ Chave PIX copiada!');
    }

    // ========================
    // Funções da Lógica do Carrinho
    // ========================
    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        updateCartUI();
        showNotification(`✅ ${name} adicionado!`);
    }

    function updateCartUI() {
        renderCartItems();
        updateCartTotal();
        updateCartCounter();
    }

    function renderCartItems() {
        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            return;
        }
        orderItemsContainer.innerHTML = cart.map(item => `<p>${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}</p>`).join('');
    }

    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalValueSpan.textContent = `R$ ${total.toFixed(2)}`;
    }

    function updateCartCounter() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
    }

    // ========================
    // Funções de Finalização de Pedido e Notificação
    // ========================
    
    function generateQRCode(pixKey) {
        pixKeyInput.value = pixKey;
        new QRCode(qrcodeContainer, {
        text: pixKey,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
        });
    }
    
    function sendOrder() {
        if (cart.length === 0) {
        showNotification('🛒 Seu carrinho está vazio!');
        return;
        }

        const selectedPayment = document.querySelector('input[name="pagamento"]:checked')?.value;
        const observations = obsTextarea.value.trim() || 'Nenhuma observação.';
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        let paymentDetails = `*Pagamento:* ${selectedPayment}`;
        if (selectedPayment === 'Dinheiro') {
        const trocoValue = trocoInput.value;
        if (trocoValue && trocoValue > 0) {
            paymentDetails += `\n*Troco para:* R$ ${parseFloat(trocoValue).toFixed(2)}`;
        }
        }

        const orderText = cart.map(item =>
        `• ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2)})`
        ).join('\n');
        
        const message = `
    *🧾 Novo Pedido - Periquito Lanches*

    *Itens:*
    ${orderText}

    *Total:* R$ ${total.toFixed(2)}
    ${paymentDetails}
    *Observações:* ${observations}
        `.replace(/^\s+/gm, '');

        // !!! IMPORTANTE: SUBSTITUA PELO SEU NÚMERO DE WHATSAPP !!!
        const whatsappNumber = "5519991941073"; // Use o formato 55 + DDD + Número
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        showNotification('📲 Enviando seu pedido...');
        setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        }, 1000);
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
        notification.remove();
        }, 2500);
    }

    });