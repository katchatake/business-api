const { connectDB, models } = require('../src/config/database');
const BUSINESS_TEMPLATES = require('../src/config/businessTemplates');

const seedData = async () => {
    try {
        await connectDB();
        
        console.log('Seeding business categories...');
        const categories = [
            { id: 1, name: 'RETAIL RÁPIDO (VENTA DE MOSTRADOR)', icon: 'storefront', description: 'Venta rápida de productos' },
            { id: 2, name: 'ALIMENTOS Y BEBIDAS (HORECA)', icon: 'restaurant', description: 'Restaurantes, bares y comida rápida' },
            { id: 3, name: 'RETAIL ESPECIALIZADO', icon: 'shopping_bag', description: 'Boutiques, zapaterías, electrónicas' },
            { id: 4, name: 'SERVICIOS', icon: 'content_cut', description: 'Estéticas, Barberías, Spas' }
        ];

        await models.business_categories.bulkCreate(categories, {
            updateOnDuplicate: ['name', 'icon', 'description']
        });

        console.log('Seeding business types (templates)...');
        const types = [
            { category_id: 1, name: 'ABARROTES', config_template: BUSINESS_TEMPLATES.ABARROTES },
            { category_id: 1, name: 'FARMACIA', config_template: BUSINESS_TEMPLATES.FARMACIA },
            { category_id: 1, name: 'FERRETERIA', config_template: BUSINESS_TEMPLATES.FERRETERIA },
            { category_id: 2, name: 'RESTAURANTE', config_template: BUSINESS_TEMPLATES.RESTAURANTE },
            { category_id: 2, name: 'FAST_FOOD', config_template: BUSINESS_TEMPLATES.FAST_FOOD },
            { category_id: 2, name: 'BAR', config_template: BUSINESS_TEMPLATES.BAR },
            { category_id: 3, name: 'BOUTIQUE', config_template: BUSINESS_TEMPLATES.BOUTIQUE },
            { category_id: 3, name: 'ELECTRONICA', config_template: BUSINESS_TEMPLATES.ELECTRONICA },
            { category_id: 4, name: 'ESTETICA', config_template: BUSINESS_TEMPLATES.ESTETICA }
        ];

        for (const type of types) {
            const existing = await models.business_types.findOne({ where: { name: type.name } });
            if (existing) {
                await existing.update(type);
            } else {
                await models.business_types.create(type);
            }
        }

        console.log('✔ Seeders executed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error executing seeders:', error);
        process.exit(1);
    }
};

seedData();
