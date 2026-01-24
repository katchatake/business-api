const ProductBrandsService = require('./product-brands.service');
const service = new ProductBrandsService();

const listBrands = async (req, res, next) => {
  try {
    const { business_id } = req.user;
    const brands = await service.findAll(business_id);
    res.json(brands);
  } catch (error) {
    next(error);
  }
};

const getBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const brand = await service.findOne(id, business_id);
    res.json(brand);
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const body = req.body;
    const { business_id } = req.user;
    const newBrand = await service.create(body, business_id);
    res.status(201).json(newBrand);
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const { business_id } = req.user;
    const updatedBrand = await service.update(id, body, business_id);
    res.json(updatedBrand);
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
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
  listBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand,
};
