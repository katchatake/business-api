var DataTypes = require("sequelize").DataTypes;
var _appointments = require("./appointments");
var _branches = require("./branches");
var _business_categories = require("./business_categories");
var _business_csd = require("./business_csd");
var _business_types = require("./business_types");
var _businesses = require("./businesses");
var _cash_shifts = require("./cash_shifts");
var _customer_ledger = require("./customer_ledger");
var _customers = require("./customers");
var _debt_payments = require("./debt_payments");
var _fiscal_invoices = require("./fiscal_invoices");
var _inventory = require("./inventory");
var _order_items = require("./order_items");
var _order_payments = require("./order_payments");
var _orders = require("./orders");
var _platform_admins = require("./platform_admins");
var _platform_audit_logs = require("./platform_audit_logs");
var _platform_sessions = require("./platform_sessions");
var _product_variants = require("./product_variants");
var _products = require("./products");
var _promotion_products = require("./promotion_products");
var _promotions = require("./promotions");
var _recipes = require("./recipes");
var _saas_invoices = require("./saas_invoices");
var _saas_plans = require("./saas_plans");
var _supplies = require("./supplies");
var _user_sessions = require("./user_sessions");
var _users = require("./users");

function initModels(sequelize) {
  var appointments = _appointments(sequelize, DataTypes);
  var branches = _branches(sequelize, DataTypes);
  var business_categories = _business_categories(sequelize, DataTypes);
  var business_csd = _business_csd(sequelize, DataTypes);
  var business_types = _business_types(sequelize, DataTypes);
  var businesses = _businesses(sequelize, DataTypes);
  var cash_shifts = _cash_shifts(sequelize, DataTypes);
  var customer_ledger = _customer_ledger(sequelize, DataTypes);
  var customers = _customers(sequelize, DataTypes);
  var debt_payments = _debt_payments(sequelize, DataTypes);
  var fiscal_invoices = _fiscal_invoices(sequelize, DataTypes);
  var inventory = _inventory(sequelize, DataTypes);
  var order_items = _order_items(sequelize, DataTypes);
  var order_payments = _order_payments(sequelize, DataTypes);
  var orders = _orders(sequelize, DataTypes);
  var platform_admins = _platform_admins(sequelize, DataTypes);
  var platform_audit_logs = _platform_audit_logs(sequelize, DataTypes);
  var platform_sessions = _platform_sessions(sequelize, DataTypes);
  var product_variants = _product_variants(sequelize, DataTypes);
  var products = _products(sequelize, DataTypes);
  var promotion_products = _promotion_products(sequelize, DataTypes);
  var promotions = _promotions(sequelize, DataTypes);
  var recipes = _recipes(sequelize, DataTypes);
  var saas_invoices = _saas_invoices(sequelize, DataTypes);
  var saas_plans = _saas_plans(sequelize, DataTypes);
  var supplies = _supplies(sequelize, DataTypes);
  var user_sessions = _user_sessions(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  products.belongsToMany(promotions, { as: 'promotion_id_promotions', through: promotion_products, foreignKey: "product_id", otherKey: "promotion_id" });
  promotions.belongsToMany(products, { as: 'product_id_products', through: promotion_products, foreignKey: "promotion_id", otherKey: "product_id" });
  appointments.belongsTo(branches, { as: "branch", foreignKey: "branch_id"});
  branches.hasMany(appointments, { as: "appointments", foreignKey: "branch_id"});
  inventory.belongsTo(branches, { as: "branch", foreignKey: "branch_id"});
  branches.hasMany(inventory, { as: "inventories", foreignKey: "branch_id"});
  users.belongsTo(branches, { as: "branch", foreignKey: "branch_id"});
  branches.hasMany(users, { as: "users", foreignKey: "branch_id"});
  business_types.belongsTo(business_categories, { as: "category", foreignKey: "category_id"});
  business_categories.hasMany(business_types, { as: "business_types", foreignKey: "category_id"});
  businesses.belongsTo(business_types, { as: "business_type", foreignKey: "business_type_id"});
  business_types.hasMany(businesses, { as: "businesses", foreignKey: "business_type_id"});
  appointments.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(appointments, { as: "appointments", foreignKey: "business_id"});
  branches.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(branches, { as: "branches", foreignKey: "business_id"});
  business_csd.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(business_csd, { as: "business_csds", foreignKey: "business_id"});
  customers.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(customers, { as: "customers", foreignKey: "business_id"});
  products.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(products, { as: "products", foreignKey: "business_id"});
  promotions.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(promotions, { as: "promotions", foreignKey: "business_id"});
  saas_invoices.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(saas_invoices, { as: "saas_invoices", foreignKey: "business_id"});
  supplies.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(supplies, { as: "supplies", foreignKey: "business_id"});
  users.belongsTo(businesses, { as: "business", foreignKey: "business_id"});
  businesses.hasMany(users, { as: "users", foreignKey: "business_id"});
  orders.belongsTo(cash_shifts, { as: "shift", foreignKey: "shift_id"});
  cash_shifts.hasMany(orders, { as: "orders", foreignKey: "shift_id"});
  appointments.belongsTo(customers, { as: "customer", foreignKey: "customer_id"});
  customers.hasMany(appointments, { as: "appointments", foreignKey: "customer_id"});
  order_items.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(order_items, { as: "order_items", foreignKey: "order_id"});
  order_payments.belongsTo(orders, { as: "order", foreignKey: "order_id"});
  orders.hasMany(order_payments, { as: "order_payments", foreignKey: "order_id"});
  platform_audit_logs.belongsTo(platform_admins, { as: "admin", foreignKey: "admin_id"});
  platform_admins.hasMany(platform_audit_logs, { as: "platform_audit_logs", foreignKey: "admin_id"});
  platform_sessions.belongsTo(platform_admins, { as: "admin", foreignKey: "admin_id"});
  platform_admins.hasMany(platform_sessions, { as: "platform_sessions", foreignKey: "admin_id"});
  product_variants.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(product_variants, { as: "product_variants", foreignKey: "product_id"});
  promotion_products.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(promotion_products, { as: "promotion_products", foreignKey: "product_id"});
  recipes.belongsTo(products, { as: "product", foreignKey: "product_id"});
  products.hasMany(recipes, { as: "recipes", foreignKey: "product_id"});
  order_items.belongsTo(promotions, { as: "promotion", foreignKey: "promotion_id"});
  promotions.hasMany(order_items, { as: "order_items", foreignKey: "promotion_id"});
  promotion_products.belongsTo(promotions, { as: "promotion", foreignKey: "promotion_id"});
  promotions.hasMany(promotion_products, { as: "promotion_products", foreignKey: "promotion_id"});
  businesses.belongsTo(saas_plans, { as: "saas_plan", foreignKey: "saas_plan_id"});
  saas_plans.hasMany(businesses, { as: "businesses", foreignKey: "saas_plan_id"});
  recipes.belongsTo(supplies, { as: "supply", foreignKey: "supply_id"});
  supplies.hasMany(recipes, { as: "recipes", foreignKey: "supply_id"});
  appointments.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(appointments, { as: "appointments", foreignKey: "user_id"});
  cash_shifts.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(cash_shifts, { as: "cash_shifts", foreignKey: "user_id"});
  user_sessions.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(user_sessions, { as: "user_sessions", foreignKey: "user_id"});

  products.hasOne(inventory, {
    foreignKey: 'item_id',
    constraints: false,
    scope: {
      item_type: 'PRODUCT'
    },
    as: 'stock'
  });

  return {
    appointments,
    branches,
    business_categories,
    business_csd,
    business_types,
    businesses,
    cash_shifts,
    customer_ledger,
    customers,
    debt_payments,
    fiscal_invoices,
    inventory,
    order_items,
    order_payments,
    orders,
    platform_admins,
    platform_audit_logs,
    platform_sessions,
    product_variants,
    products,
    promotion_products,
    promotions,
    recipes,
    saas_invoices,
    saas_plans,
    supplies,
    user_sessions,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
