/**
 * OsmoIA - Panel de Administración
 * Gestión de productos, conocimiento y consultas
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const elements = {
        navLinks: document.querySelectorAll('.admin-nav a'),
        tabs: document.querySelectorAll('.admin-tab'),

        // Dashboard
        totalProducts: document.getElementById('totalProducts'),
        totalKnowledge: document.getElementById('totalKnowledge'),
        totalPending: document.getElementById('totalPending'),
        totalContacts: document.getElementById('totalContacts'),
        pendingBadge: document.getElementById('pendingBadge'),
        contactsBadge: document.getElementById('contactsBadge'),
        recentPending: document.getElementById('recentPending'),

        // Products
        addProductBtn: document.getElementById('addProductBtn'),
        adminProductsList: document.getElementById('adminProductsList'),
        productFormModal: document.getElementById('productFormModal'),
        closeProductForm: document.getElementById('closeProductForm'),
        productForm: document.getElementById('productForm'),
        cancelProduct: document.getElementById('cancelProduct'),
        productFormTitle: document.getElementById('productFormTitle'),
        errorsContainer: document.getElementById('errorsContainer'),
        addErrorBtn: document.getElementById('addErrorBtn'),
        fileUploadArea: document.getElementById('fileUploadArea'),
        productFiles: document.getElementById('productFiles'),
        uploadedFiles: document.getElementById('uploadedFiles'),

        // Knowledge
        addKnowledgeBtn: document.getElementById('addKnowledgeBtn'),
        knowledgeList: document.getElementById('knowledgeList'),
        knowledgeFormModal: document.getElementById('knowledgeFormModal'),
        closeKnowledgeForm: document.getElementById('closeKnowledgeForm'),
        knowledgeForm: document.getElementById('knowledgeForm'),
        cancelKnowledge: document.getElementById('cancelKnowledge'),
        knowledgeFormTitle: document.getElementById('knowledgeFormTitle'),

        // Pending
        pendingList: document.getElementById('pendingList'),
        pendingQuestionModal: document.getElementById('pendingQuestionModal'),
        closePendingModal: document.getElementById('closePendingModal'),
        pendingQuestionContent: document.getElementById('pendingQuestionContent'),
        pendingResponseForm: document.getElementById('pendingResponseForm'),
        ignorePending: document.getElementById('ignorePending'),

        // Contacts
        contactsList: document.getElementById('contactsList'),

        // Stats
        statTotalQuestions: document.getElementById('statTotalQuestions'),
        statSuccessful: document.getElementById('statSuccessful'),
        statSuccessRate: document.getElementById('statSuccessRate'),
        topQuestions: document.getElementById('topQuestions'),

        // Toast
        toastContainer: document.getElementById('toastContainer')
    };

    let currentProductFiles = [];
    let currentEditingId = null;

    // ===== Inicialización =====
    function init() {
        setupEventListeners();
        loadDashboard();
        loadProducts();
        loadKnowledge();
        loadPendingQuestions();
        loadContactRequests();
        loadStats();
    }

    // ===== Event Listeners =====
    function setupEventListeners() {
        // Navegación
        elements.navLinks.forEach(link => {
            link.addEventListener('click', handleNavigation);
        });

        // Products
        elements.addProductBtn.addEventListener('click', () => openProductForm());
        elements.closeProductForm.addEventListener('click', closeProductForm);
        elements.cancelProduct.addEventListener('click', closeProductForm);
        elements.productForm.addEventListener('submit', handleProductSubmit);
        elements.addErrorBtn.addEventListener('click', addErrorEntry);
        elements.productFiles.addEventListener('change', handleFileUpload);

        // Knowledge
        elements.addKnowledgeBtn.addEventListener('click', () => openKnowledgeForm());
        elements.closeKnowledgeForm.addEventListener('click', closeKnowledgeForm);
        elements.cancelKnowledge.addEventListener('click', closeKnowledgeForm);
        elements.knowledgeForm.addEventListener('submit', handleKnowledgeSubmit);

        // Pending
        elements.closePendingModal.addEventListener('click', closePendingModal);
        elements.pendingResponseForm.addEventListener('submit', handlePendingResponse);
        elements.ignorePending.addEventListener('click', handleIgnorePending);

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });
    }

    // ===== Navegación =====
    function handleNavigation(e) {
        e.preventDefault();
        const tab = e.currentTarget.dataset.tab;
        showTab(tab);

        elements.navLinks.forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }

    function showTab(tabName) {
        elements.tabs.forEach(tab => tab.classList.remove('active'));
        const targetTab = document.getElementById(tabName + 'Tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Refrescar datos según la pestaña
        switch(tabName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'products':
                loadProducts();
                break;
            case 'knowledge':
                loadKnowledge();
                break;
            case 'pending':
                loadPendingQuestions();
                break;
            case 'contacts':
                loadContactRequests();
                break;
            case 'stats':
                loadStats();
                break;
        }
    }

    // ===== Dashboard =====
    function loadDashboard() {
        const products = OsmofilterIA.getProducts();
        const knowledge = OsmofilterIA.getKnowledge();
        const pending = OsmofilterIA.getPendingQuestions();
        const contacts = OsmofilterIA.getContactRequests().filter(c => c.status === 'new');

        elements.totalProducts.textContent = products.length;
        elements.totalKnowledge.textContent = knowledge.length;
        elements.totalPending.textContent = pending.length;
        elements.totalContacts.textContent = contacts.length;

        elements.pendingBadge.textContent = pending.length;
        elements.contactsBadge.textContent = contacts.length;

        // Últimas consultas pendientes
        if (pending.length > 0) {
            elements.recentPending.innerHTML = pending.slice(0, 5).map(p => `
                <div class="recent-item">
                    <span>${escapeHtml(truncate(p.question, 50))}</span>
                    <span class="date">${formatDate(p.createdAt)}</span>
                </div>
            `).join('');
        } else {
            elements.recentPending.innerHTML = '<p class="empty-state">No hay consultas pendientes</p>';
        }
    }

    // ===== Products =====
    function loadProducts() {
        const products = OsmofilterIA.getProducts();

        if (products.length === 0) {
            elements.adminProductsList.innerHTML = '<p class="empty-state">No hay productos. Añade el primero.</p>';
            return;
        }

        elements.adminProductsList.innerHTML = products.map(product => `
            <div class="admin-product-item" data-id="${product.id}">
                <div class="admin-product-info">
                    <h3>${escapeHtml(product.name)}</h3>
                    <p class="ref">Ref: ${escapeHtml(product.ref)}</p>
                    <div class="meta">
                        ${product.category ? `<span>📁 ${escapeHtml(product.category)}</span>` : ''}
                        <span>🔧 ${product.errors ? product.errors.length : 0} errores</span>
                        <span>📄 ${product.files ? product.files.length : 0} archivos</span>
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-icon edit" title="Editar" onclick="editProduct('${product.id}')">✏️</button>
                    <button class="btn-icon delete" title="Eliminar" onclick="deleteProduct('${product.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    function openProductForm(product = null) {
        currentEditingId = product ? product.id : null;
        elements.productFormTitle.textContent = product ? 'Editar Producto' : 'Añadir Producto';

        // Limpiar formulario
        elements.productForm.reset();
        elements.errorsContainer.innerHTML = '';
        elements.uploadedFiles.innerHTML = '';
        currentProductFiles = [];

        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productRef').value = product.ref || '';
            document.getElementById('productName').value = product.name || '';
            document.getElementById('productAltName').value = product.altName || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productCategory').value = product.category || '';

            // Cargar archivos existentes
            if (product.files && product.files.length > 0) {
                currentProductFiles = [...product.files];
                renderUploadedFiles();
            }

            // Cargar errores existentes
            if (product.errors && product.errors.length > 0) {
                product.errors.forEach(error => addErrorEntry(error));
            }
        }

        openModal('productFormModal');
    }

    function closeProductForm() {
        closeModal('productFormModal');
        currentEditingId = null;
        currentProductFiles = [];
    }

    function handleProductSubmit(e) {
        e.preventDefault();

        const product = {
            id: document.getElementById('productId').value || null,
            ref: document.getElementById('productRef').value,
            name: document.getElementById('productName').value,
            altName: document.getElementById('productAltName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            files: currentProductFiles,
            errors: collectErrors()
        };

        OsmofilterIA.saveProduct(product);
        showToast('Producto guardado correctamente', 'success');
        closeProductForm();
        loadProducts();
        loadDashboard();
    }

    window.editProduct = function(productId) {
        const products = OsmofilterIA.getProducts();
        const product = products.find(p => p.id === productId);
        if (product) {
            openProductForm(product);
        }
    };

    window.deleteProduct = function(productId) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            OsmofilterIA.deleteProduct(productId);
            showToast('Producto eliminado', 'success');
            loadProducts();
            loadDashboard();
        }
    };

    // ===== Errores y Soluciones =====
    function addErrorEntry(existingError = null) {
        const errorId = 'error_' + Date.now();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-entry';
        errorDiv.id = errorId;

        const description = existingError && existingError.description ? existingError.description : '';
        const solutions = existingError && existingError.solutions ? existingError.solutions : [];

        errorDiv.innerHTML = `
            <div class="error-entry-header">
                <span>⚠️ Error/Problema</span>
                <button type="button" class="remove-error" onclick="removeErrorEntry('${errorId}')">&times;</button>
            </div>
            <div class="form-group">
                <input type="text" class="error-description" placeholder="Descripción del error..." value="${escapeHtml(description)}">
            </div>
            <div class="solutions-container" id="solutions_${errorId}">
                <label>✅ Soluciones:</label>
                ${solutions.map((sol, i) => `
                    <div class="solution-entry">
                        <input type="text" class="solution-input" value="${escapeHtml(sol)}">
                        <button type="button" class="remove-solution" onclick="this.parentElement.remove()">&times;</button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-secondary btn-small add-solution-btn" onclick="addSolution('${errorId}')">+ Añadir solución</button>
        `;

        elements.errorsContainer.appendChild(errorDiv);
    }

    window.removeErrorEntry = function(errorId) {
        const errorDiv = document.getElementById(errorId);
        if (errorDiv) {
            errorDiv.remove();
        }
    };

    window.addSolution = function(errorId) {
        const solutionsContainer = document.getElementById('solutions_' + errorId);
        const solutionDiv = document.createElement('div');
        solutionDiv.className = 'solution-entry';
        solutionDiv.innerHTML = `
            <input type="text" class="solution-input" placeholder="Posible solución...">
            <button type="button" class="remove-solution" onclick="this.parentElement.remove()">&times;</button>
        `;
        solutionsContainer.appendChild(solutionDiv);
    };

    function collectErrors() {
        const errors = [];
        const errorEntries = elements.errorsContainer.querySelectorAll('.error-entry');

        errorEntries.forEach(entry => {
            const description = entry.querySelector('.error-description').value.trim();
            if (description) {
                const solutions = [];
                entry.querySelectorAll('.solution-input').forEach(input => {
                    if (input.value.trim()) {
                        solutions.push(input.value.trim());
                    }
                });
                errors.push({ description, solutions });
            }
        });

        return errors;
    }

    // ===== File Upload =====
    function handleFileUpload(e) {
        const files = Array.from(e.target.files);

        files.forEach(file => {
            // Simular URL de archivo (en producción usarías un servidor real)
            const fileObj = {
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file),
                uploadedAt: new Date().toISOString()
            };
            currentProductFiles.push(fileObj);
        });

        renderUploadedFiles();
    }

    function renderUploadedFiles() {
        elements.uploadedFiles.innerHTML = currentProductFiles.map((file, index) => `
            <div class="uploaded-file">
                <span>📄 ${escapeHtml(file.name)}</span>
                <button type="button" class="remove-file" onclick="removeFile(${index})">&times;</button>
            </div>
        `).join('');
    }

    window.removeFile = function(index) {
        currentProductFiles.splice(index, 1);
        renderUploadedFiles();
    };

    // ===== Knowledge =====
    function loadKnowledge() {
        const knowledge = OsmofilterIA.getKnowledge();

        if (knowledge.length === 0) {
            elements.knowledgeList.innerHTML = '<p class="empty-state">No hay artículos de conocimiento. Añade el primero.</p>';
            return;
        }

        elements.knowledgeList.innerHTML = knowledge.map(article => `
            <div class="knowledge-item" data-id="${article.id}">
                <span class="category">${escapeHtml(article.category || 'General')}</span>
                <h3>${escapeHtml(article.title)}</h3>
                <p class="preview">${escapeHtml(truncate(article.content, 150))}</p>
                <div class="actions">
                    <button class="btn-secondary btn-small" onclick="editKnowledge('${article.id}')">✏️ Editar</button>
                    <button class="btn-danger btn-small" onclick="deleteKnowledge('${article.id}')">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    function openKnowledgeForm(article = null) {
        currentEditingId = article ? article.id : null;
        elements.knowledgeFormTitle.textContent = article ? 'Editar Conocimiento' : 'Añadir Conocimiento';

        elements.knowledgeForm.reset();

        if (article) {
            document.getElementById('knowledgeId').value = article.id;
            document.getElementById('knowledgeTitle').value = article.title || '';
            document.getElementById('knowledgeCategory').value = article.category || 'general';
            document.getElementById('knowledgeTags').value = (article.tags || []).join(', ');
            document.getElementById('knowledgeContent').value = article.content || '';
        }

        openModal('knowledgeFormModal');
    }

    function closeKnowledgeForm() {
        closeModal('knowledgeFormModal');
        currentEditingId = null;
    }

    function handleKnowledgeSubmit(e) {
        e.preventDefault();

        const tagsInput = document.getElementById('knowledgeTags').value;
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

        const article = {
            id: document.getElementById('knowledgeId').value || null,
            title: document.getElementById('knowledgeTitle').value,
            category: document.getElementById('knowledgeCategory').value,
            tags: tags,
            content: document.getElementById('knowledgeContent').value
        };

        OsmofilterIA.saveKnowledge(article);
        showToast('Conocimiento guardado correctamente', 'success');
        closeKnowledgeForm();
        loadKnowledge();
        loadDashboard();
    }

    window.editKnowledge = function(articleId) {
        const knowledge = OsmofilterIA.getKnowledge();
        const article = knowledge.find(k => k.id === articleId);
        if (article) {
            openKnowledgeForm(article);
        }
    };

    window.deleteKnowledge = function(articleId) {
        if (confirm('¿Estás seguro de eliminar este artículo?')) {
            OsmofilterIA.deleteKnowledge(articleId);
            showToast('Artículo eliminado', 'success');
            loadKnowledge();
            loadDashboard();
        }
    };

    // ===== Pending Questions =====
    function loadPendingQuestions() {
        const pending = OsmofilterIA.getPendingQuestions();

        if (pending.length === 0) {
            elements.pendingList.innerHTML = '<p class="empty-state">No hay consultas pendientes</p>';
            return;
        }

        elements.pendingList.innerHTML = pending.map(item => `
            <div class="pending-item" data-id="${item.id}">
                <p class="question">"${escapeHtml(item.question)}"</p>
                <p class="meta">Recibida: ${formatDate(item.createdAt)}</p>
                <div class="actions">
                    <button class="btn-primary btn-small" onclick="respondPending('${item.id}')">Responder</button>
                    <button class="btn-secondary btn-small" onclick="ignorePendingQuestion('${item.id}')">Ignorar</button>
                </div>
            </div>
        `).join('');
    }

    window.respondPending = function(questionId) {
        const pending = OsmofilterIA.getPendingQuestions();
        const question = pending.find(p => p.id === questionId);

        if (question) {
            document.getElementById('pendingQuestionId').value = questionId;
            elements.pendingQuestionContent.innerHTML = `
                <div class="info-box">
                    <h4>Pregunta del cliente:</h4>
                    <p>"${escapeHtml(question.question)}"</p>
                </div>
            `;
            openModal('pendingQuestionModal');
        }
    };

    window.ignorePendingQuestion = function(questionId) {
        if (confirm('¿Estás seguro de ignorar esta consulta?')) {
            OsmofilterIA.deletePendingQuestion(questionId);
            showToast('Consulta ignorada', 'success');
            loadPendingQuestions();
            loadDashboard();
        }
    };

    function closePendingModal() {
        closeModal('pendingQuestionModal');
    }

    function handlePendingResponse(e) {
        e.preventDefault();

        const questionId = document.getElementById('pendingQuestionId').value;
        const response = document.getElementById('pendingResponse').value;
        const addToKnowledge = document.getElementById('addToKnowledge').checked;

        const pending = OsmofilterIA.getPendingQuestions();
        const question = pending.find(p => p.id === questionId);

        if (addToKnowledge && question) {
            // Crear artículo de conocimiento con la respuesta
            OsmofilterIA.saveKnowledge({
                title: 'Respuesta: ' + truncate(question.question, 50),
                category: 'otros',
                tags: OsmofilterIA.extractKeywords(question.question),
                content: `Pregunta: ${question.question}\n\nRespuesta: ${response}`
            });
        }

        // Eliminar de pendientes
        OsmofilterIA.deletePendingQuestion(questionId);

        showToast('Respuesta guardada', 'success');
        closePendingModal();
        elements.pendingResponseForm.reset();
        loadPendingQuestions();
        loadKnowledge();
        loadDashboard();
    }

    function handleIgnorePending() {
        const questionId = document.getElementById('pendingQuestionId').value;
        OsmofilterIA.deletePendingQuestion(questionId);
        showToast('Consulta ignorada', 'success');
        closePendingModal();
        loadPendingQuestions();
        loadDashboard();
    }

    // ===== Contact Requests =====
    function loadContactRequests() {
        const contacts = OsmofilterIA.getContactRequests();

        if (contacts.length === 0) {
            elements.contactsList.innerHTML = '<p class="empty-state">No hay solicitudes de contacto</p>';
            return;
        }

        elements.contactsList.innerHTML = contacts.map(contact => `
            <div class="contact-item ${contact.status}" data-id="${contact.id}">
                <h3>${escapeHtml(contact.name)}</h3>
                ${contact.company ? `<p class="company">${escapeHtml(contact.company)}</p>` : ''}
                <p class="phone">📞 ${escapeHtml(contact.phone)}</p>
                ${contact.email ? `<p>✉️ ${escapeHtml(contact.email)}</p>` : ''}
                ${contact.question ? `<p class="question">"${escapeHtml(contact.question)}"</p>` : ''}
                ${contact.message ? `<p class="question">"${escapeHtml(contact.message)}"</p>` : ''}
                <p class="date">📅 ${formatDate(contact.createdAt)}</p>
                <div class="actions">
                    ${contact.status === 'new' ? `
                        <button class="btn-primary btn-small" onclick="markContacted('${contact.id}')">✓ Marcar contactado</button>
                    ` : '<span style="color: var(--success-color)">✓ Contactado</span>'}
                    <button class="btn-danger btn-small" onclick="deleteContact('${contact.id}')">🗑️ Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    window.markContacted = function(contactId) {
        OsmofilterIA.updateContactStatus(contactId, 'contacted');
        showToast('Marcado como contactado', 'success');
        loadContactRequests();
        loadDashboard();
    };

    window.deleteContact = function(contactId) {
        if (confirm('¿Estás seguro de eliminar esta solicitud?')) {
            OsmofilterIA.deleteContactRequest(contactId);
            showToast('Solicitud eliminada', 'success');
            loadContactRequests();
            loadDashboard();
        }
    };

    // ===== Stats =====
    function loadStats() {
        const stats = OsmofilterIA.getStats();

        elements.statTotalQuestions.textContent = stats.totalQuestions;
        elements.statSuccessful.textContent = stats.successfulAnswers;

        const rate = stats.totalQuestions > 0
            ? Math.round((stats.successfulAnswers / stats.totalQuestions) * 100)
            : 0;
        elements.statSuccessRate.textContent = rate + '%';

        // Top preguntas
        const topQuestions = Object.entries(stats.questionFrequency || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        if (topQuestions.length > 0) {
            elements.topQuestions.innerHTML = topQuestions.map(([question, count]) => `
                <div class="top-list-item">
                    <span>${escapeHtml(truncate(question, 40))}</span>
                    <strong>${count}</strong>
                </div>
            `).join('');
        } else {
            elements.topQuestions.innerHTML = '<p class="empty-state">Sin datos aún</p>';
        }
    }

    // ===== Modales =====
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // ===== Toast Notifications =====
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== Utilidades =====
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Iniciar
    init();
});
