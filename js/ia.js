/**
 * OSMOFILTER IA Engine
 * Motor de IA basado en búsqueda de patrones y coincidencias
 * Utiliza localStorage para almacenar y recuperar conocimiento
 */

const OsmofilterIA = {
    // Configuración
    config: {
        minConfidence: 0.3, // Confianza mínima para dar una respuesta
        maxResults: 5,
        storageKeys: {
            products: 'osmofilter_products',
            knowledge: 'osmofilter_knowledge',
            pendingQuestions: 'osmofilter_pending',
            contactRequests: 'osmofilter_contacts',
            stats: 'osmofilter_stats',
            conversationHistory: 'osmofilter_conversation'
        }
    },

    // Conocimiento base inicial sobre tratamiento de agua
    baseKnowledge: [
        {
            id: 'base_1',
            title: 'Ósmosis Inversa - Conceptos básicos',
            category: 'tratamiento-agua',
            tags: ['ósmosis', 'inversa', 'membrana', 'purificación', 'agua'],
            content: `La ósmosis inversa es un proceso de purificación del agua que utiliza una membrana semipermeable para eliminar iones, moléculas y partículas más grandes del agua potable.

El proceso funciona aplicando presión al agua para forzarla a través de la membrana, que actúa como un filtro extremadamente fino. El resultado es agua purificada de alta calidad.

Componentes típicos de un sistema de ósmosis:
- Prefiltro de sedimentos (5 micras)
- Filtro de carbón activo granular (GAC)
- Filtro de carbón activo en bloque (CTO)
- Membrana de ósmosis inversa
- Postfiltro de carbón
- Depósito de almacenamiento
- Grifo dispensador

La membrana es el corazón del sistema y puede eliminar hasta el 99% de los contaminantes disueltos.`
        },
        {
            id: 'base_2',
            title: 'Descalcificadores - Funcionamiento',
            category: 'tratamiento-agua',
            tags: ['descalcificador', 'cal', 'dureza', 'resina', 'sodio', 'intercambio iónico'],
            content: `Los descalcificadores funcionan mediante intercambio iónico. Contienen resinas que intercambian los iones de calcio y magnesio (que causan la dureza) por iones de sodio.

Proceso de funcionamiento:
1. El agua dura entra en el tanque de resina
2. Los iones de calcio y magnesio se adhieren a la resina
3. Los iones de sodio se liberan al agua
4. El agua sale "blanda"

Cuando la resina se satura, se regenera con salmuera (agua con sal). Por eso los descalcificadores necesitan sal regularmente.

Mantenimiento básico:
- Añadir sal cuando el nivel esté bajo (cada 2-4 semanas según consumo)
- Verificar que la regeneración se ejecute correctamente
- Limpiar el tanque de sal una vez al año
- Revisar los ajustes de dureza periódicamente`
        },
        {
            id: 'base_3',
            title: 'Tipos de filtros y su función',
            category: 'tratamiento-agua',
            tags: ['filtro', 'sedimentos', 'carbón', 'cartucho', 'recambio'],
            content: `Tipos principales de filtros para tratamiento de agua:

1. FILTRO DE SEDIMENTOS:
- Elimina partículas sólidas como arena, óxido, suciedad
- Medidas comunes: 50, 20, 5 y 1 micra
- Cambio recomendado: cada 6-12 meses

2. FILTRO DE CARBÓN ACTIVO GRANULAR (GAC):
- Elimina cloro, olores y sabores
- Mejora el sabor del agua
- Cambio recomendado: cada 6-12 meses

3. FILTRO DE CARBÓN EN BLOQUE (CTO):
- Similar al GAC pero más compacto y efectivo
- Elimina cloro, compuestos orgánicos volátiles
- Cambio recomendado: cada 6-12 meses

4. MEMBRANA DE ÓSMOSIS:
- Elimina sales disueltas, metales pesados, bacterias
- Cambio recomendado: cada 2-3 años

5. POSTFILTRO:
- Pulido final del agua
- Mejora el sabor antes del consumo
- Cambio recomendado: cada 12 meses`
        },
        {
            id: 'base_4',
            title: 'Problemas comunes y soluciones',
            category: 'problemas',
            tags: ['problema', 'presión', 'baja', 'goteo', 'ruido', 'sabor', 'fuga'],
            content: `PROBLEMAS FRECUENTES EN SISTEMAS DE ÓSMOSIS:

1. POCA PRODUCCIÓN DE AGUA / FLUJO LENTO:
- Causa: Filtros saturados → Solución: Cambiar filtros
- Causa: Presión de entrada baja → Solución: Instalar bomba
- Causa: Membrana agotada → Solución: Reemplazar membrana
- Causa: Depósito sin presión → Solución: Presurizar (0.5-0.7 bar)

2. AGUA CON MAL SABOR:
- Causa: Postfiltro saturado → Solución: Cambiar postfiltro
- Causa: Depósito contaminado → Solución: Desinfectar depósito
- Causa: Mucho tiempo sin usar → Solución: Vaciar y renovar agua

3. RUIDOS EN EL SISTEMA:
- Causa: Aire en el sistema → Solución: Purgar sistema
- Causa: Alta presión de entrada → Solución: Instalar reductor
- Causa: Válvulas defectuosas → Solución: Revisar/cambiar válvulas

4. FUGAS:
- Causa: Conexiones flojas → Solución: Apretar conexiones
- Causa: Juntas deterioradas → Solución: Cambiar juntas
- Causa: Carcasa de filtro dañada → Solución: Reemplazar carcasa`
        },
        {
            id: 'base_5',
            title: 'Mantenimiento preventivo',
            category: 'mantenimiento',
            tags: ['mantenimiento', 'cambio', 'filtros', 'limpieza', 'revisión'],
            content: `GUÍA DE MANTENIMIENTO PREVENTIVO:

CADA 6-12 MESES:
- Cambiar prefiltros (sedimentos, carbón)
- Verificar estado de conexiones
- Comprobar presión del depósito
- Limpiar exterior del equipo

CADA 12-24 MESES:
- Cambiar postfiltro
- Desinfectar circuito si es necesario
- Revisar válvulas antirretorno

CADA 2-3 AÑOS:
- Cambiar membrana de ósmosis
- Inspección general del sistema
- Considerar cambio de depósito si es necesario

DESCALCIFICADORES:
- Comprobar nivel de sal semanalmente
- Añadir sal cuando sea necesario
- Limpieza anual del tanque de sal
- Verificar dureza del agua tratada mensualmente

CONSEJOS:
- Usar siempre recambios originales o de calidad equivalente
- Anotar fechas de cambio de filtros
- Ante cualquier duda, consultar con servicio técnico`
        }
    ],

    /**
     * Inicializa el motor de IA
     */
    init() {
        this.loadBaseKnowledge();
        this.initStats();
        console.log('OsmofilterIA inicializado');
    },

    /**
     * Carga el conocimiento base si no existe
     */
    loadBaseKnowledge() {
        const existingKnowledge = this.getKnowledge();
        if (existingKnowledge.length === 0) {
            localStorage.setItem(
                this.config.storageKeys.knowledge,
                JSON.stringify(this.baseKnowledge)
            );
        }
    },

    /**
     * Inicializa estadísticas si no existen
     */
    initStats() {
        if (!localStorage.getItem(this.config.storageKeys.stats)) {
            localStorage.setItem(this.config.storageKeys.stats, JSON.stringify({
                totalQuestions: 0,
                successfulAnswers: 0,
                pendingAnswers: 0,
                questionFrequency: {}
            }));
        }
    },

    /**
     * Obtiene todos los productos
     */
    getProducts() {
        const data = localStorage.getItem(this.config.storageKeys.products);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Guarda un producto
     */
    saveProduct(product) {
        const products = this.getProducts();
        const existingIndex = products.findIndex(p => p.id === product.id);

        if (existingIndex >= 0) {
            products[existingIndex] = product;
        } else {
            product.id = product.id || 'prod_' + Date.now();
            product.createdAt = product.createdAt || new Date().toISOString();
            products.push(product);
        }

        localStorage.setItem(this.config.storageKeys.products, JSON.stringify(products));
        return product;
    },

    /**
     * Elimina un producto
     */
    deleteProduct(productId) {
        const products = this.getProducts().filter(p => p.id !== productId);
        localStorage.setItem(this.config.storageKeys.products, JSON.stringify(products));
    },

    /**
     * Obtiene todo el conocimiento
     */
    getKnowledge() {
        const data = localStorage.getItem(this.config.storageKeys.knowledge);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Guarda un artículo de conocimiento
     */
    saveKnowledge(article) {
        const knowledge = this.getKnowledge();
        const existingIndex = knowledge.findIndex(k => k.id === article.id);

        if (existingIndex >= 0) {
            knowledge[existingIndex] = article;
        } else {
            article.id = article.id || 'know_' + Date.now();
            article.createdAt = article.createdAt || new Date().toISOString();
            knowledge.push(article);
        }

        localStorage.setItem(this.config.storageKeys.knowledge, JSON.stringify(knowledge));
        return article;
    },

    /**
     * Elimina un artículo de conocimiento
     */
    deleteKnowledge(articleId) {
        const knowledge = this.getKnowledge().filter(k => k.id !== articleId);
        localStorage.setItem(this.config.storageKeys.knowledge, JSON.stringify(knowledge));
    },

    /**
     * Obtiene preguntas pendientes
     */
    getPendingQuestions() {
        const data = localStorage.getItem(this.config.storageKeys.pendingQuestions);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Añade una pregunta pendiente
     */
    addPendingQuestion(question) {
        const pending = this.getPendingQuestions();
        pending.push({
            id: 'pend_' + Date.now(),
            question: question,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.config.storageKeys.pendingQuestions, JSON.stringify(pending));
        this.updateStats('pendingAnswers', 1);
    },

    /**
     * Elimina una pregunta pendiente
     */
    deletePendingQuestion(questionId) {
        const pending = this.getPendingQuestions().filter(p => p.id !== questionId);
        localStorage.setItem(this.config.storageKeys.pendingQuestions, JSON.stringify(pending));
    },

    /**
     * Obtiene solicitudes de contacto
     */
    getContactRequests() {
        const data = localStorage.getItem(this.config.storageKeys.contactRequests);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Añade una solicitud de contacto
     */
    addContactRequest(contact) {
        const contacts = this.getContactRequests();
        contacts.push({
            id: 'cont_' + Date.now(),
            ...contact,
            status: 'new',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem(this.config.storageKeys.contactRequests, JSON.stringify(contacts));
        return contacts[contacts.length - 1];
    },

    /**
     * Actualiza estado de contacto
     */
    updateContactStatus(contactId, status) {
        const contacts = this.getContactRequests();
        const index = contacts.findIndex(c => c.id === contactId);
        if (index >= 0) {
            contacts[index].status = status;
            localStorage.setItem(this.config.storageKeys.contactRequests, JSON.stringify(contacts));
        }
    },

    /**
     * Elimina solicitud de contacto
     */
    deleteContactRequest(contactId) {
        const contacts = this.getContactRequests().filter(c => c.id !== contactId);
        localStorage.setItem(this.config.storageKeys.contactRequests, JSON.stringify(contacts));
    },

    /**
     * Obtiene estadísticas
     */
    getStats() {
        const data = localStorage.getItem(this.config.storageKeys.stats);
        return data ? JSON.parse(data) : {
            totalQuestions: 0,
            successfulAnswers: 0,
            pendingAnswers: 0,
            questionFrequency: {}
        };
    },

    /**
     * Actualiza estadísticas
     */
    updateStats(key, increment = 1) {
        const stats = this.getStats();
        if (typeof stats[key] === 'number') {
            stats[key] += increment;
        }
        localStorage.setItem(this.config.storageKeys.stats, JSON.stringify(stats));
    },

    /**
     * Registra frecuencia de pregunta
     */
    trackQuestion(question) {
        const stats = this.getStats();
        const normalized = this.normalizeText(question).substring(0, 50);
        stats.questionFrequency[normalized] = (stats.questionFrequency[normalized] || 0) + 1;
        stats.totalQuestions++;
        localStorage.setItem(this.config.storageKeys.stats, JSON.stringify(stats));
    },

    /**
     * Normaliza texto para búsqueda
     */
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    },

    /**
     * Extrae palabras clave de una pregunta
     */
    extractKeywords(text) {
        const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del',
            'en', 'con', 'por', 'para', 'que', 'qué', 'cual', 'cuál', 'como', 'cómo',
            'donde', 'dónde', 'cuando', 'cuándo', 'es', 'son', 'está', 'están', 'hay',
            'tiene', 'tienen', 'puede', 'pueden', 'hacer', 'hago', 'tengo', 'mi', 'mis',
            'su', 'sus', 'este', 'esta', 'esto', 'ese', 'esa', 'eso', 'al', 'se', 'si',
            'no', 'muy', 'mas', 'pero', 'porque', 'cuando', 'sobre', 'entre', 'sin', 'ya',
            'me', 'te', 'le', 'nos', 'les', 'lo', 'la', 'a', 'y', 'o', 'e', 'u'];

        const normalized = this.normalizeText(text);
        const words = normalized.split(' ').filter(word =>
            word.length > 2 && !stopWords.includes(word)
        );

        return [...new Set(words)]; // Elimina duplicados
    },

    /**
     * Calcula similitud entre dos textos
     */
    calculateSimilarity(text1, text2) {
        const words1 = new Set(this.extractKeywords(text1));
        const words2 = new Set(this.extractKeywords(text2));

        if (words1.size === 0 || words2.size === 0) return 0;

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    },

    /**
     * Busca en los productos
     */
    searchProducts(query) {
        const products = this.getProducts();
        const keywords = this.extractKeywords(query);
        const results = [];

        for (const product of products) {
            let score = 0;
            const searchableText = [
                product.name,
                product.altName || '',
                product.ref,
                product.description || '',
                product.category || ''
            ].join(' ');

            // Búsqueda por coincidencia exacta de nombre
            if (this.normalizeText(product.name).includes(this.normalizeText(query))) {
                score += 0.5;
            }

            // Búsqueda por palabras clave
            for (const keyword of keywords) {
                if (this.normalizeText(searchableText).includes(keyword)) {
                    score += 0.2;
                }
            }

            // Búsqueda en errores
            if (product.errors && product.errors.length > 0) {
                for (const error of product.errors) {
                    if (this.normalizeText(error.description).includes(this.normalizeText(query))) {
                        score += 0.3;
                        // Incluir las soluciones encontradas
                        results.push({
                            type: 'error',
                            product: product,
                            error: error,
                            score: score
                        });
                    }
                }
            }

            if (score > 0) {
                results.push({
                    type: 'product',
                    product: product,
                    score: score
                });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, this.config.maxResults);
    },

    /**
     * Busca en el conocimiento
     */
    searchKnowledge(query) {
        const knowledge = this.getKnowledge();
        const keywords = this.extractKeywords(query);
        const results = [];

        for (const article of knowledge) {
            let score = 0;
            const searchableText = [
                article.title,
                article.content,
                (article.tags || []).join(' ')
            ].join(' ');

            // Similitud general
            score += this.calculateSimilarity(query, searchableText);

            // Bonus por coincidencia en título
            if (this.normalizeText(article.title).includes(this.normalizeText(query))) {
                score += 0.3;
            }

            // Bonus por coincidencia en tags
            if (article.tags) {
                for (const tag of article.tags) {
                    for (const keyword of keywords) {
                        if (this.normalizeText(tag).includes(keyword)) {
                            score += 0.15;
                        }
                    }
                }
            }

            if (score > 0) {
                results.push({
                    type: 'knowledge',
                    article: article,
                    score: score
                });
            }
        }

        return results.sort((a, b) => b.score - a.score).slice(0, this.config.maxResults);
    },

    /**
     * Procesa una pregunta y genera una respuesta
     */
    async processQuestion(question) {
        // Registrar pregunta en estadísticas
        this.trackQuestion(question);

        // Buscar en productos y conocimiento
        const productResults = this.searchProducts(question);
        const knowledgeResults = this.searchKnowledge(question);

        // Combinar y ordenar resultados
        const allResults = [...productResults, ...knowledgeResults]
            .sort((a, b) => b.score - a.score);

        // Si no hay resultados con suficiente confianza
        if (allResults.length === 0 || allResults[0].score < this.config.minConfidence) {
            return {
                success: false,
                confidence: 0,
                message: 'Lo siento, no tengo información suficiente para responder a tu pregunta.',
                needsContact: true
            };
        }

        // Generar respuesta basada en los resultados
        const response = this.generateResponse(question, allResults);

        // Actualizar estadísticas
        if (response.success) {
            this.updateStats('successfulAnswers');
        }

        return response;
    },

    /**
     * Genera una respuesta formateada
     */
    generateResponse(question, results) {
        const topResult = results[0];
        let response = {
            success: true,
            confidence: topResult.score,
            message: '',
            relatedProducts: [],
            relatedArticles: []
        };

        // Si la confianza es baja, marcar para revisión
        if (topResult.score < 0.4) {
            this.addPendingQuestion(question);
            response.lowConfidence = true;
        }

        // Generar mensaje según el tipo de resultado principal
        if (topResult.type === 'error') {
            response.message = this.formatErrorResponse(topResult);
        } else if (topResult.type === 'product') {
            response.message = this.formatProductResponse(topResult);
            response.relatedProducts.push(topResult.product);
        } else if (topResult.type === 'knowledge') {
            response.message = this.formatKnowledgeResponse(topResult, question);
            response.relatedArticles.push(topResult.article);
        }

        // Añadir información adicional relevante
        const additionalInfo = results.slice(1, 3).filter(r => r.score > 0.2);
        if (additionalInfo.length > 0) {
            response.message += '\n\n📌 **Información adicional que puede interesarte:**\n';
            for (const info of additionalInfo) {
                if (info.type === 'product') {
                    response.message += `- Producto relacionado: ${info.product.name}\n`;
                    response.relatedProducts.push(info.product);
                } else if (info.type === 'knowledge') {
                    response.message += `- ${info.article.title}\n`;
                    response.relatedArticles.push(info.article);
                }
            }
        }

        return response;
    },

    /**
     * Formatea respuesta de error/solución
     */
    formatErrorResponse(result) {
        let message = `He encontrado información sobre este problema en el producto **${result.product.name}**:\n\n`;
        message += `⚠️ **Problema:** ${result.error.description}\n\n`;

        if (result.error.solutions && result.error.solutions.length > 0) {
            message += `✅ **Posibles soluciones:**\n`;
            result.error.solutions.forEach((sol, i) => {
                message += `${i + 1}. ${sol}\n`;
            });
        }

        return message;
    },

    /**
     * Formatea respuesta de producto
     */
    formatProductResponse(result) {
        const product = result.product;
        let message = `He encontrado el producto **${product.name}**`;

        if (product.altName) {
            message += ` (también conocido como ${product.altName})`;
        }

        message += `:\n\n`;
        message += `📦 **Referencia:** ${product.ref}\n`;

        if (product.category) {
            message += `📁 **Categoría:** ${product.category}\n`;
        }

        if (product.description) {
            message += `\n${product.description}\n`;
        }

        if (product.errors && product.errors.length > 0) {
            message += `\n🔧 Este producto tiene **${product.errors.length} problema(s) documentado(s)** con sus soluciones.`;
        }

        return message;
    },

    /**
     * Formatea respuesta de conocimiento
     */
    formatKnowledgeResponse(result, question) {
        const article = result.article;
        const keywords = this.extractKeywords(question);

        // Extraer la parte más relevante del contenido
        let content = article.content;
        let relevantSection = this.extractRelevantSection(content, keywords);

        let message = `📚 **${article.title}**\n\n`;
        message += relevantSection;

        return message;
    },

    /**
     * Extrae la sección más relevante de un texto largo
     */
    extractRelevantSection(content, keywords) {
        const sentences = content.split(/[.!?]\s+/);
        const scoredSentences = [];

        for (let i = 0; i < sentences.length; i++) {
            let score = 0;
            const normalized = this.normalizeText(sentences[i]);

            for (const keyword of keywords) {
                if (normalized.includes(keyword)) {
                    score += 1;
                }
            }

            scoredSentences.push({ index: i, sentence: sentences[i], score });
        }

        // Ordenar por relevancia
        scoredSentences.sort((a, b) => b.score - a.score);

        // Tomar las 5 oraciones más relevantes, manteniendo el orden original
        const topSentences = scoredSentences
            .slice(0, 5)
            .sort((a, b) => a.index - b.index)
            .map(s => s.sentence);

        let result = topSentences.join('. ').trim();

        // Si el resultado es muy corto, devolver más contenido
        if (result.length < 200 && content.length > 200) {
            result = content.substring(0, 500);
            if (content.length > 500) {
                result += '...';
            }
        }

        return result;
    },

    /**
     * Exporta todos los datos (para backup)
     */
    exportData() {
        return {
            products: this.getProducts(),
            knowledge: this.getKnowledge(),
            pendingQuestions: this.getPendingQuestions(),
            contactRequests: this.getContactRequests(),
            stats: this.getStats(),
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Importa datos (para restaurar backup)
     */
    importData(data) {
        if (data.products) {
            localStorage.setItem(this.config.storageKeys.products, JSON.stringify(data.products));
        }
        if (data.knowledge) {
            localStorage.setItem(this.config.storageKeys.knowledge, JSON.stringify(data.knowledge));
        }
        if (data.pendingQuestions) {
            localStorage.setItem(this.config.storageKeys.pendingQuestions, JSON.stringify(data.pendingQuestions));
        }
        if (data.contactRequests) {
            localStorage.setItem(this.config.storageKeys.contactRequests, JSON.stringify(data.contactRequests));
        }
        if (data.stats) {
            localStorage.setItem(this.config.storageKeys.stats, JSON.stringify(data.stats));
        }
    },

    /**
     * Limpia todos los datos
     */
    clearAllData() {
        Object.values(this.config.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init(); // Reinicializar con datos base
    }
};

// Inicializar cuando se carga el script
OsmofilterIA.init();
