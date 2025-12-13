/* =========================================
   SCRIPT UNIFICADO
   ========================================= */

// --- 1. VARIABLES GLOBALES ---
let cart = [];
const MAX_QTY = 30;
let cartSleepTimer;

// Elementos DOM
const sections = document.querySelectorAll('section');
const navDots = document.querySelectorAll('.side-nav a');
const cartIcon = document.getElementById('cart-icon-container');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCountBadge = document.getElementById('cart-count');
const cartTotalElement = document.getElementById('cart-total');

// --- 2. NAVEGACIÓN & SCROLL ---
const observerOptions = {
    root: document.querySelector('.scroll-container'),
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navDots.forEach(dot => dot.classList.remove('active'));
            const id = entry.target.getAttribute('id');
            const activeDot = document.querySelector(`.side-nav a[href="#${id}"]`);
            if (activeDot) activeDot.classList.add('active');
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// --- 3. LÓGICA DEL LOADER ---
window.addEventListener('load', function() {
    setTimeout(function() {
        document.body.classList.add('loaded');
        setTimeout(() => {
            const loader = document.getElementById('loader-wrapper');
            if(loader) loader.style.display = 'none';
        }, 1500);
    }, 1500);
    setTimeout(() => window.scrollTo(0, 1), 0);
});

// --- 4. LÓGICA DEL CARRITO ---

// A. Función Toast
function showToast(message) {
    const toast = document.getElementById('pepsi-toast');
    const toastMsg = document.getElementById('toast-message');
    
    if (!toast) {
        const newToast = document.createElement('div');
        newToast.id = 'pepsi-toast';
        newToast.className = 'pepsi-toast';
        newToast.innerHTML = '<span id="toast-message"></span>';
        document.body.appendChild(newToast);
        setTimeout(() => showToast(message), 0);
        return;
    }

    if(toast && toastMsg) {
        toastMsg.innerText = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// B. Modificar Cantidad
function updateQuantity(name, price, img, change, maxQty = null) {
    const existingItem = cart.find(item => item.name === name);
    let limit = MAX_QTY;
    
    if (existingItem && existingItem.maxLimit) {
        limit = existingItem.maxLimit;
    } else if (maxQty) {
        limit = parseInt(maxQty);
    }

    if (existingItem) {
        const newQty = existingItem.qty + change;

        if (newQty > limit) {
            if(limit === 1) {
                showToast("¡Edición Limitada: Solo 1 por persona!");
            } else {
                showToast(`¡Máximo ${limit} unidades por producto!`);
            }
            return;
        }

        if (newQty <= 0) {
            cart = cart.filter(item => item.name !== name);
        } else {
            existingItem.qty = newQty;
        }

    } else {
        if (change > 0) {
            cart.push({ name, price, img, qty: 1, maxLimit: limit });
        }
    }

    updateCartUI();
    renderProductsButtons(); 
    wakeUpCart();
}

// C. Renderizar Botones
function renderProductsButtons() {
    const cards = document.querySelectorAll('.product-card, .hero-product-card');

    cards.forEach(card => {
        let productName = "";
        const titleElement = card.querySelector('h3');
        if (titleElement) productName = titleElement.innerText.trim();

        let actionContainer = card.querySelector('.action-container, .action-container-hero');
        
        if (actionContainer && !actionContainer.dataset.name) {
            const innerBtn = actionContainer.querySelector('.add-to-cart-btn');
            if (innerBtn) {
                actionContainer.dataset.name = innerBtn.dataset.name;
                actionContainer.dataset.price = innerBtn.dataset.price;
                actionContainer.dataset.img = innerBtn.dataset.img;
                actionContainer.dataset.maxQty = innerBtn.dataset.maxQty || MAX_QTY;
                if (!productName) productName = innerBtn.dataset.name.trim();
            }
        }

        if (!actionContainer) {
            const originalBtn = card.querySelector('.add-to-cart-btn');
            if (originalBtn) {
                actionContainer = document.createElement('div');
                const isHeroBtn = originalBtn.classList.contains('btn-primary');
                actionContainer.className = isHeroBtn ? 'action-container-hero' : 'action-container';
                
                if(isHeroBtn) {
                     actionContainer.style.width = "200px"; 
                     actionContainer.style.margin = "20px auto";
                }

                actionContainer.dataset.name = originalBtn.dataset.name;
                actionContainer.dataset.price = originalBtn.dataset.price;
                actionContainer.dataset.img = originalBtn.dataset.img;
                actionContainer.dataset.maxQty = originalBtn.dataset.maxQty || MAX_QTY;
                
                if (!productName) productName = originalBtn.dataset.name.trim();

                originalBtn.parentNode.insertBefore(actionContainer, originalBtn);
                originalBtn.remove();
            }
        }

        if (!actionContainer || !actionContainer.dataset.name) return;

        const name = actionContainer.dataset.name;
        const price = actionContainer.dataset.price;
        const img = actionContainer.dataset.img;
        const maxQty = actionContainer.dataset.maxQty;
        
        const visibleName = name.trim().toLowerCase();
        const cartItem = cart.find(item => item.name.trim().toLowerCase() === visibleName);

        const isHero = actionContainer.classList.contains('action-container-hero');
        const inactiveBtnClass = isHero ? 'btn-primary' : 'btn-pepsi-action';
        const btnText = isHero ? 'AÑADIR AL CARRO' : 'AGREGAR';

        if (cartItem) {
            actionContainer.innerHTML = `
                <div class="btn-pepsi-action qty-mode" style="${isHero ? 'border:2px solid white;' : ''}">
                    <button class="qty-btn" onclick="updateQuantity('${name}', '${price}', '${img}', -1, ${maxQty})">−</button>
                    <span class="qty-number">${cartItem.qty}</span>
                    <button class="qty-btn" onclick="updateQuantity('${name}', '${price}', '${img}', 1, ${maxQty})">+</button>
                </div>
            `;
        } else {
            actionContainer.innerHTML = `
                <a href="#" class="${inactiveBtnClass}" onclick="updateQuantity('${name}', '${price}', '${img}', 1, ${maxQty}); return false;">
                   ${btnText}
                </a>
            `;
        }
    });
}

// D. Actualizar UI Carrito
function updateCartUI() {
    const totalItems = cart.reduce((total, product) => total + (product.qty || 0), 0);
    
    cartCountBadge.innerText = totalItems;
    cartCountBadge.style.display = totalItems === 0 ? 'none' : 'flex';

    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Tu carrito está vacío 🥤</p>';
    } else {
        cart.forEach((product) => {
            const unitPrice = parseFloat(product.price) || 0;
            const itemQty = parseInt(product.qty) || 0;
            const itemTotal = unitPrice * itemQty;
            totalPrice += itemTotal;
            const displayName = product.name || "Producto";

            const itemHTML = `
                <div class="cart-item">
                    <img src="${product.img}" alt="img" onerror="this.src='Img/pepsi-can-small.png'">
                    <div class="item-details">
                        <h4>${displayName}</h4>
                        <small>$${unitPrice.toFixed(2)} x ${itemQty}</small>
                    </div>
                    
                    <div class="cart-item-actions">
                         <button class="btn-remove-small" onclick="updateQuantity('${product.name}', '${product.price}', '${product.img}', -1)">-</button>
                         <span style="color:white; font-weight:bold; margin:0 5px;">${itemQty}</span>
                         <button class="btn-remove-small" onclick="updateQuantity('${product.name}', '${product.price}', '${product.img}', 1)">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });
    }
    
    cartTotalElement.innerText = '$' + totalPrice.toFixed(2);
}

// --- 5. EVENTOS Y ESTILOS ---

// Eventos de Carrito (Modo Fantasma)
function handleCartClick(e) {
    if (cartIcon.classList.contains('cart-idle')) {
        e.stopPropagation(); 
        wakeUpCart(); 
    } else {
        toggleCart();
    }
}

function wakeUpCart() {
    cartIcon.classList.remove('cart-idle');
    cartIcon.classList.add('waking-up');
    setTimeout(() => cartIcon.classList.remove('waking-up'), 300);
    resetSleepTimer(); 
}

function sleepCart() {
    if (!cartSidebar.classList.contains('active')) {
        cartIcon.classList.add('cart-idle');
    }
}

function resetSleepTimer() {
    clearTimeout(cartSleepTimer);
    cartSleepTimer = setTimeout(sleepCart, 3000); 
}

cartIcon.removeEventListener('click', toggleCart); 
cartIcon.addEventListener('click', handleCartClick);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

window.addEventListener('scroll', () => {
    if (!cartIcon.classList.contains('cart-idle')) {
        resetSleepTimer();
    }
});

function toggleCart() {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderProductsButtons();
    setTimeout(sleepCart, 2000); 
});

// Estilos Dinámicos
const style = document.createElement('style');
style.innerHTML = `
    .cart-item-actions { display: flex; align-items: center; }
    .btn-remove-small {
        background: #333; color: white; border: none; width: 25px; height: 25px; border-radius: 5px; cursor: pointer;
    }
    .btn-remove-small:hover { background: #555; }
`;
document.head.appendChild(style);

/* =========================================
   LOGICA DEL POPUP DE PAGO & VALIDACIONES
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const paymentForm = document.getElementById('payment-form');
    const formContainer = document.getElementById('checkout-form-container');
    const successMessage = document.getElementById('success-message');
    const closeSuccessBtn = document.getElementById('close-success-btn');
    const totalDisplay = document.getElementById('checkout-total-display');

    // Inputs para máscaras
    const cardInput = document.getElementById('card-num');
    const dateInput = document.getElementById('card-date');
    const cvcInput = document.getElementById('card-cvc');
    const duiInput = document.getElementById('dui-input');
    const phoneInput = document.getElementById('phone');

    // --- 1. ABRIR EL MODAL (Detección Inteligente) ---
// --- 1. ABRIR EL MODAL (Detección Inteligente) ---
    // --- 1. ABRIR EL MODAL (CORREGIDO Y DEFINITIVO) ---
    document.body.addEventListener('click', function(e) {
        // 1. Detectar el botón correctamente (para PC y Móvil)
        // .closest('button') busca el botón padre si hiciste click en el texto o ícono
        const targetBtn = e.target.closest('button');
        
        // 2. Verificar si es el botón de PAGAR
        const isCheckoutBtn = targetBtn && (
            targetBtn.id === 'checkout-btn' || 
            (targetBtn.closest('.cart-footer') && /PAGAR|COMPRAR|CHECKOUT/i.test(targetBtn.innerText))
        );

        if (isCheckoutBtn) {
            e.preventDefault(); 
            
            // A. Verificar si el carrito está vacío (Tu lógica original)
            if (typeof cart !== 'undefined' && cart.length === 0) {
                showToast("Tu carrito está vacío 🥤");
                return;
            }

            // B. Sincronizar el precio total antes de abrir
            const currentTotal = document.getElementById('cart-total');
            const modalTotal = document.getElementById('checkout-total-display');
            if(modalTotal && currentTotal) {
                modalTotal.innerText = currentTotal.innerText;
            }
            
            // C. Cerrar el carrito lateral (Importante para que no tape el modal en PC)
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-overlay');
            if(cartSidebar) cartSidebar.classList.remove('active');
            if(cartOverlay) cartOverlay.classList.remove('active');

            // D. Abrir el modal usando TU función original
            // (Antes fallaba porque llamábamos a una función que no existía)
            openModal();
        }
    });



    function openModal() {
        if(!checkoutModal) return;
        checkoutModal.classList.add('active');
        formContainer.style.display = 'block';
        successMessage.style.display = 'none';
        // Limpiamos el form
        if(paymentForm) paymentForm.reset();
    }

    function closeModal() {
        if(!checkoutModal) return;
        checkoutModal.classList.remove('active');
    }

    // Cerrar eventos
    if(closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeModal);
    if(checkoutModal) checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeModal();
    });

    // --- 2. MÁSCARAS DE ENTRADA (FORMATOS AUTOMÁTICOS) ---

    // A. Tarjeta: Espacios cada 4 números (0000 0000...)
    if(cardInput) {
        cardInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, ''); // Quitar no números
            let formattedValue = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
            }
            e.target.value = formattedValue.slice(0, 19);
        });
    }

    // B. Fecha: MM/AA automático
    if(dateInput) {
        dateInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                // Limitar mes a 12
                let month = parseInt(value.substring(0, 2));
                if (month > 12) value = '12' + value.substring(2);
                if (month === 0) value = '01' + value.substring(2);
            }
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }

    // C. CVC: Solo números
    if(cvcInput) {
        cvcInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // D. DUI: 00000000-0
    if(duiInput) {
        duiInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, ''); // Solo números
            if (value.length > 8) {
                e.target.value = value.substring(0, 8) + '-' + value.substring(8, 9);
            } else {
                e.target.value = value.substring(0, 9);
            }
        });
    }

    // E. Celular: 0000-0000
    if(phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 4) {
                e.target.value = value.substring(0, 4) + '-' + value.substring(4, 8);
            } else {
                e.target.value = value.substring(0, 8);
            }
        });
    }

    // --- 3. PROCESO DE PAGO SIMULADO ---
    if(paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = paymentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            // Estado de carga
            submitBtn.innerText = "PROCESANDO...";
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
            submitBtn.style.cursor = "wait";

            // Simulación de API (2 segundos)
            setTimeout(() => {
                formContainer.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Vaciar Carrito globalmente
                if(typeof cart !== 'undefined') {
                    cart = [];
                    // Llamar a tus funciones de actualización si existen
                    if(typeof updateCartUI === 'function') updateCartUI();
                    if(typeof renderProductsButtons === 'function') renderProductsButtons();
                    if(typeof wakeUpCart === 'function') wakeUpCart();
                }

                // Restaurar botón
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
                submitBtn.style.cursor = "pointer";
            }, 2000);
        });
    }

    if(closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            closeModal();
            // Cerrar sidebar del carrito también
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-overlay');
            if(cartSidebar) cartSidebar.classList.remove('active');
            if(cartOverlay) cartOverlay.classList.remove('active');
        });
    }
});
