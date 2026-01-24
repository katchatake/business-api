const ProductCategoriesService = require('./product-categories.service');
const service = new ProductCategoriesService();

const listCategories = async (req, res, next) => {
  try {
    const { business_id } = req.user;
    const categories = await service.findAll(business_id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const category = await service.findOne(id, business_id);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const body = req.body;
    const { business_id } = req.user;
    const newCategory = await service.create(body, business_id);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { business_id } = req.user;
    const updatedCategory = await service.update(id, body, business_id);
    res.json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    await service.remove(id, business_id);
    res.status(201).json({ id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
