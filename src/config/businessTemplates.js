/**
 * DICCIONARIO MAESTRO DE CONFIGURACIONES (SETTINGS)
 * Estas son las "Semillas" que definen el comportamiento del SaaS
 * según el giro del negocio.
 */

const BUSINESS_TEMPLATES = {
    // =================================================================
    // CATEGORÍA 1: RETAIL RÁPIDO (VENTA DE MOSTRADOR)
    // =================================================================
    
    // 1. Tienda de Abarrotes / Miscelánea
    ABARROTES: {
        modules: {
            tables: false,
            kitchen: false,
            delivery: false,
            appointments: false
        },
        inventory: {
            strategy: "simple",       // Resta 1 a 1
            allow_negative: true,     // Permite vender aunque no haya stock cargado
            ask_weight: true,         // Activa popup para báscula (Jamón, Fruta)
            expiration: false
        },
        pos_interface: {
            layout: "list",           // Lista compacta para escáner
            require_customer: false,  // Venta anónima rápida
            quick_pay_buttons: [20, 50, 100, 200, 500],
            tips_enabled: false
        },
        fiscal: {
            default_product_sat: "01010101", // "No existe en el catálogo"
            default_unit_sat: "H87"          // Pieza
        }
    },

    // 2. Farmacia
    FARMACIA: {
        modules: {
            tables: false,
            kitchen: false,
            appointments: false
        },
        inventory: {
            strategy: "batches",      // Lotes obligatorios
            allow_negative: false,    // Estricto por COFEPRIS
            ask_weight: false,
            expiration: true          // Alerta de caducidad
        },
        pos_interface: {
            layout: "list",
            require_customer: false,
            tips_enabled: false
        },
        fiscal: {
            default_product_sat: "51000000", // Medicamentos
            default_unit_sat: "H87"
        }
    },

    // 3. Ferretería / Tlapalería
    FERRETERIA: {
        modules: {
            tables: false,
            kitchen: false,
            delivery: true // Material de construcción
        },
        inventory: {
            strategy: "simple",
            allow_negative: true,
            ask_weight: false, 
            decimal_quantities: true // Venta de cable por metros (ej: 5.5 mts)
        },
        pos_interface: {
            layout: "list",
            require_customer: true, // Facturación común en construcción
            tips_enabled: false
        },
        fiscal: {
            default_product_sat: "31160000", // Ferretería en general
            default_unit_sat: "H87"
        }
    },

    // =================================================================
    // CATEGORÍA 2: ALIMENTOS Y BEBIDAS (HORECA)
    // =================================================================

    // 4. Restaurante (Servicio a Mesa)
    RESTAURANTE: {
        modules: {
            tables: true,           // Mapa de Mesas ACTIVO
            kitchen: true,          // Impresión de Comanda ACTIVO
            kds: true,              // Pantalla de Cocina
            delivery: true,
            appointments: true      // Para Reservaciones
        },
        inventory: {
            strategy: "recipe",     // Descuenta insumos (Pan, Carne)
            allow_negative: false
        },
        pos_interface: {
            layout: "grid",         // Botones grandes con foto
            require_customer: false,
            tips_enabled: true,     // Sugerencia de propina (10%, 15%)
            quick_modifiers: true   // "Sin cebolla", "Término medio"
        },
        fiscal: {
            default_product_sat: "90101500", // Restaurantes
            default_unit_sat: "E48"          // Unidad de servicio
        }
    },

    // 5. Fast Food / Cafetería
    FAST_FOOD: {
        modules: {
            tables: false,          // Sin mapa, flujo lineal
            kitchen: true,          // Manda a preparar
            delivery: true,
            pickup: true
        },
        inventory: {
            strategy: "recipe",
            allow_negative: false
        },
        pos_interface: {
            layout: "grid",
            require_customer: false,
            tips_enabled: true,
            customer_display: true, // Pantalla secundaria para el cliente
            quick_modifiers: true
        },
        fiscal: {
            default_product_sat: "90101500",
            default_unit_sat: "E48"
        }
    },

    // 6. Bar / Cervecería
    BAR: {
        modules: {
            tables: true,
            kitchen: true,          // Barra de bebidas
            open_tabs: true         // "Cuentas abiertas" (Dejar tarjeta)
        },
        inventory: {
            strategy: "recipe",     // Botella -> Tragos (ml)
            allow_negative: false
        },
        pos_interface: {
            layout: "grid",
            require_customer: false,
            tips_enabled: true,
            happy_hour: true        // Precios dinámicos por hora
        },
        fiscal: {
            default_product_sat: "90101500",
            default_unit_sat: "E48"
        }
    },

    // =================================================================
    // CATEGORÍA 3: RETAIL ESPECIALIZADO
    // =================================================================

    // 7. Boutique de Ropa / Zapatería
    BOUTIQUE: {
        modules: {
            tables: false,
            kitchen: false,
            commissions: true       // Comisión para el vendedor
        },
        inventory: {
            strategy: "variant",    // Matriz Talla/Color
            variant_attributes: ["Talla", "Color", "Modelo"],
            allow_negative: false
        },
        pos_interface: {
            layout: "grid",
            require_customer: true, // Fidelización (Marketing)
            tips_enabled: false
        },
        fiscal: {
            default_product_sat: "53100000", // Ropa
            default_unit_sat: "H87"
        }
    },

    // 8. Electrónica / Celulares
    ELECTRONICA: {
        modules: {
            tables: false,
            kitchen: false,
            repair: true            // Módulo de Reparaciones
        },
        inventory: {
            strategy: "serialized", // Pide IMEI o No. Serie al vender
            allow_negative: false,
            warranty_tracking: true // Control de garantías
        },
        pos_interface: {
            layout: "list",
            require_customer: true, // Obligatorio para garantía
            tips_enabled: false
        },
        fiscal: {
            default_product_sat: "43210000", // Equipo informático
            default_unit_sat: "H87"
        }
    },

    // =================================================================
    // CATEGORÍA 4: SERVICIOS
    // =================================================================

    // 9. Estética / Barbería / Spa
    ESTETICA: {
        modules: {
            tables: false,
            kitchen: false,
            appointments: true,     // Agenda es el Home
            commissions: true       // Pago por corte al estilista
        },
        inventory: {
            strategy: "consumables", // Shampoo, tinte (Gasto interno)
            allow_negative: true
        },
        pos_interface: {
            layout: "grid",
            require_customer: true, // Historial de cortes
            tips_enabled: true
        },
        fiscal: {
            default_product_sat: "86121500", // Peluquería
            default_unit_sat: "E48"
        }
    }
};

module.exports = BUSINESS_TEMPLATES;
