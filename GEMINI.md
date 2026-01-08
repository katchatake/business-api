# PROYECTO: SaaS POS Multi-Tenant Polimórfico + Fiscal (CFDI 4.0)

## 1. Visión General del Proyecto

Desarrollo de un sistema Punto de Venta (POS) en la nube (SaaS) capaz de adaptar su comportamiento, interfaz y reglas de negocio según el giro del cliente (Restaurante, Retail, Farmacia, Servicios).

### Filosofía Core: "El Camaleón"

El sistema utiliza una base de código única. La diferenciación se logra mediante una configuración JSON (`settings`) inyectada al negocio, que activa/desactiva módulos y cambia algoritmos de inventario en el Backend y UI en el Frontend.

---

## 2. Arquitectura de Base de Datos (Master Script)

Estructura relacional en MySQL/MariaDB que cubre: Tenancy, Inventarios, Ventas, Caja, Créditos, Facturación y Sesiones.

```sql
-- ======================================================================================
-- MASTER SCHEMA: POS SAAS (Incluye Fiscal + Auth)
-- ======================================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------------------------
-- 1. CATÁLOGOS DE GIRO (CONFIGURACIÓN)
-- --------------------------------------------------------------------------------------
CREATE TABLE business_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    description VARCHAR(255)
);

CREATE TABLE business_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    config_template JSON NOT NULL, -- "El ADN del giro"
    FOREIGN KEY (category_id) REFERENCES business_categories(id)
);

-- --------------------------------------------------------------------------------------
-- 2. TENANCY Y DATOS MAESTROS
-- --------------------------------------------------------------------------------------
CREATE TABLE businesses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    business_type_id INT,
    settings JSON, -- Configuración instanciada
    -- Fiscales Emisor
    rfc VARCHAR(13) NULL,
    legal_name VARCHAR(255) NULL,
    tax_system_code VARCHAR(10) NULL,
    postal_code VARCHAR(10) NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_type_id) REFERENCES business_types(id)
);

-- Si ya creaste la tabla, usa ALTER TABLE. Si no, agrégalo al CREATE TABLE original.

ALTER TABLE businesses
ADD COLUMN saas_plan_id INT NULL,
ADD COLUMN status ENUM('ACTIVE', 'SUSPENDED_PAYMENT', 'BANNED', 'TRIAL') DEFAULT 'TRIAL',
ADD COLUMN subscription_end_date DATE NULL, -- Cuándo vence su pago
ADD CONSTRAINT fk_saas_plan FOREIGN KEY (saas_plan_id) REFERENCES saas_plans(id);

-- Índices para que tu Dashboard de SuperAdmin sea rápido
CREATE INDEX idx_biz_status ON businesses(status);
CREATE INDEX idx_biz_expiration ON businesses(subscription_end_date);

CREATE TABLE business_csd ( -- Certificados SAT
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    certificate_number VARCHAR(20) NOT NULL,
    file_cer_path VARCHAR(255) NOT NULL,
    file_key_path VARCHAR(255) NOT NULL,
    key_password_encrypted VARCHAR(255) NOT NULL,
    expiration_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('OWNER', 'MANAGER', 'CASHIER', 'WAITER') DEFAULT 'CASHIER',
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- --------------------------------------------------------------------------------------
-- 3. AUTENTICACIÓN (SESIONES)
-- --------------------------------------------------------------------------------------
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------------------------
-- 4. PRODUCTOS, INVENTARIOS Y PROMOCIONES
-- --------------------------------------------------------------------------------------
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    product_type ENUM('SIMPLE', 'VARIANT_PARENT', 'SERVICE') DEFAULT 'SIMPLE',
    price DECIMAL(10,2) DEFAULT 0.00,
    cost DECIMAL(10,2) DEFAULT 0.00,
    sku VARCHAR(50),
    -- Datos SAT
    sat_product_code VARCHAR(20) DEFAULT '01010101',
    sat_unit_code VARCHAR(20) DEFAULT 'H87',
    tax_object ENUM('01', '02', '03') DEFAULT '02', -- 01: No objeto, 02: Sí objeto, 03: Sí objeto y no obligado al desglose
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

ALTER TABLE products
ADD COLUMN taxes_config JSON NULL
COMMENT 'Ej: [{"code": "002", "rate": 0.16, "factor": "Tasa"}]';

CREATE TABLE product_variants ( -- Para Ropa/Zapatos
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    sku VARCHAR(50),
    attributes JSON, -- {"talla": "M", "color": "Rojo"}
    price_adjustment DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE supplies ( -- Insumos Restaurante
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20),
    cost DECIMAL(10,2),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE recipes ( -- Recetas
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    supply_id INT NOT NULL,
    quantity_required DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE
);

CREATE TABLE inventory ( -- Tabla unificada de Stock
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT NOT NULL,
    item_id INT NOT NULL,
    item_type ENUM('PRODUCT', 'VARIANT', 'SUPPLY') NOT NULL,
    quantity DECIMAL(10,4) DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('PERCENTAGE_ITEM', 'FIXED_ITEM', 'BOGO') NOT NULL, -- BOGO: Buy One Get One
    value DECIMAL(10,2) NOT NULL,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE promotion_products (
    promotion_id INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (promotion_id, product_id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- --------------------------------------------------------------------------------------
-- 5. TRANSACCIONES Y CAJA
-- --------------------------------------------------------------------------------------
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    rfc VARCHAR(13) NULL, -- Fiscal
    legal_name VARCHAR(255) NULL,
    email_invoice VARCHAR(255) NULL,
    current_debt DECIMAL(12,2) DEFAULT 0.00,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

CREATE TABLE cash_shifts ( -- Turnos de Caja
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    user_id INT NOT NULL,
    start_amount DECIMAL(12,2) DEFAULT 0.00,
    end_amount DECIMAL(12,2) NULL,
    status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE orders ( -- Cabecera de Venta
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    shift_id BIGINT NULL,
    user_id INT NOT NULL,
    customer_id INT NULL,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    order_type ENUM('INSTORE', 'TAKEAWAY', 'DINE_IN') DEFAULT 'INSTORE',

    -- Desglose de Totales
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00, -- (subtotal - total_discount_amount + total_tax_amount)

    -- Facturación
    invoice_status ENUM('UNINVOICED', 'INVOICED', 'GLOBAL_PENDING') DEFAULT 'UNINVOICED',
    claim_code VARCHAR(10) NULL, -- Para autofactura web

    metadata JSON NULL, -- {"table": 5, "waiter": "Juan"}
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shift_id) REFERENCES cash_shifts(id)
);

CREATE TABLE order_items ( -- Detalle
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id INT NOT NULL,
    product_variant_id INT NULL,
    promotion_id INT NULL,
    product_name VARCHAR(150) NOT NULL, -- Snapshot
    quantity DECIMAL(10,4) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL, -- Precio original del producto

    -- Desglose de línea
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_line DECIMAL(12,2) NOT NULL, -- (unit_price * quantity - discount_amount + tax_amount)

    attributes JSON NULL, -- {"modifiers": [...]}
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

ALTER TABLE order_items
ADD COLUMN applied_taxes JSON NULL
COMMENT 'Snapshot del cálculo: [{"code": "002", "base": 100, "rate": 0.16, "amount": 16}]';

CREATE TABLE order_payments ( -- Pagos Inmediatos
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'CREDIT_STORE') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------------------------
-- 6. CRÉDITO Y FACTURACIÓN
-- --------------------------------------------------------------------------------------
CREATE TABLE customer_ledger ( -- Kardex de Deuda
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    customer_id INT NOT NULL,
    source_type ENUM('ORDER', 'PAYMENT') NOT NULL,
    source_id BIGINT NOT NULL,
    type ENUM('DEBIT', 'CREDIT') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    new_balance DECIMAL(12,2) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE debt_payments ( -- Abonos a deuda
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shift_id BIGINT NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('CASH', 'CARD') NOT NULL
);

CREATE TABLE fiscal_invoices ( -- CFDI Timbrado
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    order_id BIGINT NULL,
    uuid VARCHAR(36) UNIQUE NULL,
    xml_content TEXT NULL,
    pdf_url VARCHAR(255) NULL,
    status ENUM('PENDING', 'STAMPED', 'ERROR') DEFAULT 'PENDING'
);

-- --------------------------------------------------------------------------------------
-- 7. CITAS (AGENDAMIENTO)
-- --------------------------------------------------------------------------------------
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    branch_id INT NOT NULL,
    customer_id INT NOT NULL,
    user_id INT NULL, -- El barbero/empleado asignado
    product_id INT NULL, -- El servicio principal agendado
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status ENUM('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW') DEFAULT 'SCHEDULED',
    notes TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ======================================================================================
-- CAPA SAAS (SUPERADMIN & SUSCRIPCIONES)
-- ======================================================================================

-- 1. Usuarios del Staff de la Plataforma (TÚ y tu equipo)
-- Estos usuarios NO pertenecen a ningún negocio. Tienen "Modo Dios".
CREATE TABLE platform_admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('SUPER_ADMIN', 'SUPPORT', 'SALES') DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================================================
-- SEGURIDAD SUPERADMIN (PLATFORM)
-- ======================================================================================

-- 1. Control de Sesiones (Refresh Tokens para Admins)
CREATE TABLE platform_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL, -- FK a platform_admins

    -- Seguridad
    refresh_token_hash VARCHAR(255) NOT NULL,

    -- Metadatos de conexión
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),

    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE, -- Kill Switch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id) REFERENCES platform_admins(id) ON DELETE CASCADE
);

-- 2. Bitácora de Auditoría (Quién hizo qué)
-- Cada vez que un SuperAdmin toque algo, se guarda aquí.
CREATE TABLE platform_audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,

    action VARCHAR(50) NOT NULL, -- Ej: 'SUSPEND_BUSINESS', 'CREATE_PLAN', 'LOGIN'
    target_id VARCHAR(50) NULL,  -- ID del negocio o usuario afectado
    details JSON NULL,           -- {"reason": "Falta de pago", "prev_status": "ACTIVE"}

    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id) REFERENCES platform_admins(id)
);

-- 2. Planes de Suscripción (Lo que le vendes a los negocios)
CREATE TABLE saas_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL, -- Ej: "Startup", "Empresarial"
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,

    -- Límites del Plan (Restrictions)
    max_users INT DEFAULT 1,
    max_branches INT DEFAULT 1,
    max_products INT DEFAULT 100,
    features JSON, -- {"modules": ["tables", "kitchen"]}

    is_active BOOLEAN DEFAULT TRUE
);

-- 3. Historial de Pagos de la Suscripción (Del negocio hacia TI)
CREATE TABLE saas_invoices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PAID', 'PENDING', 'FAILED') DEFAULT 'PENDING',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_id) REFERENCES businesses(id)
);

```

---

## 3. Arquitectura de la Aplicación (Backend)

### 3.1. Stack Tecnológico

- **Framework:** Node.js con Express.js
- **Base de Datos:** MySQL/MariaDB
- **ORM:** Sequelize para el mapeo objeto-relacional.
- **Autenticación:** Basada en JSON Web Tokens (JWT), con tokens de acceso y de refresco.
- **Validación:** `joi` para la validación de esquemas en los DTOs de entrada.
- **Manejo de Errores:** `@hapi/boom` para la creación de errores HTTP estandarizados.
- **Logging:** `winston` para el registro de eventos y errores en archivos.
- **CORS:** `cors` para permitir peticiones desde diferentes orígenes (front-end, apps móviles).

### 3.2. Estructura del Proyecto

El proyecto sigue una arquitectura en capas, modular y versionada para la API.

```
/
├── src/
│   ├── api/
│   │   └── v1/
│   │       └── modules/      # Contiene los diferentes módulos de la API (auth, products, etc.)
│   │           └── [module]/
│   │               ├── *.controller.js  # Controladores (lógica de req/res)
│   │               ├── *.service.js     # Lógica de negocio
│   │               ├── *.dao.js         # Acceso a datos (deprecado, usar modelos)
│   │               ├── *.validator.js   # Esquemas de validación con Joi
│   │               └── *.routes.js      # Definición de rutas del módulo
│   ├── config/
│   │   ├── database.js     # Configuración y conexión de Sequelize
│   │   └── ...
│   ├── middlewares/
│   │   ├── boom.middleware.js # Manejador de errores con Boom
│   │   └── validator.middleware.js # Middleware para validaciones con Joi
│   ├── models/             # Modelos de Sequelize generados automáticamente
│   │   ├── init-models.js  # Inicializador de modelos y asociaciones
│   │   └── ...
│   ├── utils/
│   │   └── logger.js       # Configuración de Winston
│   └── app.js              # Punto de entrada de la aplicación Express
├── scripts/
│   └── generate-models.js  # Script para generar modelos con sequelize-auto
└── .env                    # Variables de entorno
```

### 3.3. Flujo de Autenticación

1.  El cliente envía `username` y `password` al endpoint `/api/v1/auth/login`.
2.  El `auth.service` valida las credenciales contra la base de datos.
3.  Si son válidas, se generan dos tokens JWT:
    - **Access Token:** De corta duración (ej. 1 hora). Se usa para autorizar el acceso a rutas protegidas.
    - **Refresh Token:** De larga duración (ej. 7 días). Se usa para solicitar un nuevo access token sin necesidad de volver a iniciar sesión.
4.  El `auth.service` guarda un hash del refresh token en la tabla `user_sessions` junto con el `user_id`, IP y User-Agent.
5.  Se devuelven ambos tokens al cliente.

### 3.4. Generación de Modelos

Los modelos de Sequelize son generados automáticamente a partir de la base de datos existente usando `sequelize-auto`. Esto asegura que los modelos estén siempre sincronizados con el esquema de la base de datos.

Para regenerar los modelos después de un cambio en la base de datos, se utiliza el siguiente comando:

```bash
npm run db:generate-models
```

Este comando lee la configuración de la base de datos desde el archivo `.env`.

### 3.5. Scripts NPM

- `npm run dev`: Inicia el servidor en modo de desarrollo con `nodemon`, que reinicia automáticamente la aplicación ante cambios en el código.
- `npm start`: Inicia el servidor en modo de producción.
- `npm run db:generate-models`: Regenera los modelos de Sequelize en `src/models`.

---

## 4. API Endpoints y Flujos de Ejemplo

A continuación se detallan los flujos de los módulos implementados, con sus endpoints y payloads de ejemplo.

### 4.1. Módulo de Administración y Consulta

Endpoints diseñados para que el panel de administración pueda obtener los datos maestros del negocio.

#### 4.1.1. Listar Sucursales del Negocio

- **Endpoint:** `GET /api/v1/branches`
- **Permisos:** `OWNER`, `MANAGER`.
- **Descripción:** Devuelve una lista de todas las sucursales asociadas al negocio del usuario autenticado.

##### Ejemplo de Uso

`GET /api/v1/branches`

#### 4.1.2. Listar Usuarios del Negocio

- **Endpoint:** `GET /api/v1/users`
- **Permisos:** `OWNER`, `MANAGER`.
- **Descripción:** Devuelve una lista de los usuarios del negocio. Se puede filtrar por sucursal.
- **Parámetros de Consulta:** `?branchId=<id>` (opcional).

##### Ejemplo de Uso

`GET /api/v1/users?branchId=3` (Devuelve solo los usuarios de la sucursal 3).

---

### 4.2. Módulo de Registro de Negocios (`Businesses`)

Este módulo público permite registrar un nuevo negocio, su primera sucursal y su usuario propietario.

- **Endpoint:** `POST /api/v1/businesses`
- **Permisos:** Público, no requiere autenticación.

#### Payload de Ejemplo (Registro de una Boutique)

Asumiendo que el `businessTypeId` para "Boutique" es `7`.

```json
{
  "businessName": "Boutique Vestere",
  "businessTypeId": 7,
  "branchName": "Sucursal Principal",
  "owner": {
    "username": "admin_vestere",
    "email": "contacto@vestere.com",
    "password": "Contraseña.Segura.2025!"
  },
  "fiscal": {
    "rfc": "VES200115ABC",
    "legalName": "Vestere Moda S.A. de C.V.",
    "taxSystemCode": "601",
    "postalCode": "78216"
  }
}
```

#### 4.2.1. Actualizar Negocio

- **Endpoint:** `PUT /api/v1/businesses/{id}`
- **Permisos:** `OWNER`, `SUPER_ADMIN`.
- **Descripción:** Actualiza los detalles de un negocio existente. Requiere autenticación y autorización.

##### Payload de Ejemplo (Actualizar Negocio)

```json
{
  "name": "Nombre de Negocio Actualizado",
  "businessTypeId": 1,
  "settings": {
    "modules": {
      "inventory": {
        "enabled": true,
        "mode": "RETAIL"
      }
    },
    "ui": {
      "theme_color": "blue"
    }
  },
  "rfc": "ABC010101ABC",
  "legalName": "Nombre Legal Actualizado S.A. de C.V.",
  "taxSystemCode": "603",
  "postalCode": "78000",
  "saas_plan_id": 2,
  "status": "ACTIVE",
  "subscription_end_date": "2026-12-31"
}
```

### 4.3. Módulo de Tipos de Negocio (`Business Types`)

Este módulo de administración permite crear las plantillas o "tipos" de negocio que el sistema ofrecerá.

- **Endpoint:** `POST /api/v1/business-types`
- **Permisos:** `OWNER`.

#### Payload de Ejemplo (Crear tipo "Estética")

Asumiendo que la `categoryId` para "Servicios Personales" es `3`.

```json
{
  "name": "Estética y Salón de Belleza",
  "categoryId": 3,
  "icon": "content_cut",
  "description": "Negocios enfocados en servicios de belleza, peluquería y cuidado personal.",
  "configTemplate": {
    "modules": {
      "inventory": {
        "enabled": true,
        "mode": "SERVICE_WITH_STOCK"
      },
      "appointments": {
        "enabled": true
      }
    },
    "ui": {
      "theme_color": "pink"
    }
  }
}
```

### 4.4. Módulo de Productos (`Products`)

Permite la gestión del catálogo de productos y servicios del negocio.

#### 4.4.1. Crear Producto o Servicio

- **Endpoint:** `POST /api/v1/products`
- **Permisos:** `OWNER`, `MANAGER`. Requiere que la categoría del negocio sea de venta de productos (ej. "Retail", "Tienda de Abarrotes").

##### Payload Ejemplo (Producto Simple)

```json
{
  "name": "Coca-Cola 600ml",
  "product_type": "SIMPLE",
  "price": 18.5,
  "cost": 10.0,
  "sku": "7501055300077"
}
```

##### Payload Ejemplo (Servicio)

```json
{
  "name": "Corte de Cabello Dama",
  "product_type": "SERVICE",
  "price": 350.0,
  "cost": 0,
  "sku": "SERV-CORTE-DAMA",
  "sat_product_code": "85121700",
  "sat_unit_code": "E48"
}
```

##### Payload Ejemplo (Producto con Variantes)

```json
{
  "name": "Pantalón de Mezclilla Slim Fit",
  "product_type": "VARIANT_PARENT",
  "price": 899.0,
  "cost": 350.0,
  "sku": "PANT-MEZCLILLA-001"
}
```

#### 4.4.2. Listar Productos del Negocio

- **Endpoint:** `GET /api/v1/products`
- **Permisos:** `OWNER`, `MANAGER`, `CASHIER`, `WAITER`.
- **Parámetros de Consulta:** `?branchId=<id>` (opcional).

##### Ejemplo de Uso

`GET /api/v1/products?branchId=3` (Devuelve todos los productos del negocio, validando que el usuario tiene acceso a la sucursal 3).

### 4.5. Módulo de Citas (`Appointments`)

Permite la gestión de citas para negocios de servicios.

#### 4.5.1. Crear Cita

- **Endpoint:** `POST /api/v1/appointments`
- **Permisos:** `OWNER`, `MANAGER`, `CASHIER`.

##### Payload de Ejemplo

Agendar un servicio de "Corte de Cabello" (`productId=10`) con el empleado `userId=5`.

```json
{
  "customerId": 15,
  "branchId": 2,
  "userId": 5,
  "productId": 10,
  "startTime": "2025-12-20T14:00:00.000Z",
  "durationMinutes": 45,
  "notes": "Cliente nuevo, referido por Ana."
}
```

#### 4.5.2. Listar Citas

- **Endpoint:** `GET /api/v1/appointments`
- **Permisos:** `OWNER`, `MANAGER`, `CASHIER`, `WAITER`.
- **Parámetros de Consulta:** `?branchId=<id>`, `?userId=<id>`, `?startDate=<date>`, `?endDate=<date>`, `?status=<status>`.

##### Ejemplo de Uso

`GET /api/v1/appointments?userId=5&startDate=2025-12-21T00:00:00.000Z` (Devuelve todas las citas para el empleado 5 a partir del 21 de diciembre).

---

### 4.6. Módulo de Promociones (`Promotions`)

Permite a los administradores crear y gestionar promociones y descuentos.

#### 4.6.1. Crear una Promoción

- **Endpoint:** `POST /api/v1/promotions`
- **Permisos:** `OWNER`, `MANAGER`.

##### Payload de Ejemplo

Crear un "20% de descuento en bebidas" y asociarlo a los productos con ID 10, 12 y 15.

```json
{
  "name": "20% en Bebidas",
  "description": "Descuento de fin de semana en todas las bebidas frías.",
  "type": "PERCENTAGE_ITEM",
  "value": 20,
  "start_date": "2025-12-19T00:00:00.000Z",
  "end_date": "2025-12-21T23:59:59.000Z",
  "productIds": [10, 12, 15]
}
```

#### 4.6.2. Listar Promociones

- **Endpoint:** `GET /api/v1/promotions`
- **Permisos:** `OWNER`, `MANAGER`.

##### Ejemplo de Uso

`GET /api/v1/promotions` (Devuelve todas las promociones del negocio con los productos asociados a cada una).

#### 4.6.3. Nota sobre el Funcionamiento

El sistema valida las promociones de forma automática. Al crear una orden con `POST /api/v1/orders`, el servicio revisa la fecha y hora actual y la compara con los campos `start_date` y `end_date` de las promociones activas. Solo si la venta se produce dentro de ese rango de tiempo, el descuento será aplicado.

---

### 4.7. Módulo de Órdenes (`Orders`)

El corazón del POS, permite registrar ventas aplicando la lógica de negocio.

#### 4.7.1. Crear una Orden

- **Endpoint:** `POST /api/v1/orders`
- **Permisos:** `OWNER`, `MANAGER`, `CASHIER`, `WAITER`.
- **Descripción:** Crea una nueva orden. El sistema calcula automáticamente los descuentos por promociones activas y el desglose de impuestos.

##### Payload de Ejemplo

```json
{
  "branchId": 1,
  "customerId": 3,
  "orderType": "INSTORE",
  "items": [
    {
      "productId": 10,
      "quantity": 2
    },
    {
      "productId": 12,
      "quantity": 1
    }
  ]
}
```
