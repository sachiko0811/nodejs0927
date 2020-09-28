const Product = require('../models/product.model');
const {validationResult} = require('express-validator');

const mongoose = require('mongoose');

exports.getAddProduct = (req,res,next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        errorMessage: null
    })
};

exports.postAddProduct = (req,res,next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const product = new Product({
        // _id: new mongoose.Types.ObjectId('5f6e2d107fe91dc08154cdcb'), //demo to throw an error
        title: title, 
        imageUrl: imageUrl, 
        description: description, 
        price: price,
        userId: req.user //mongoose will pick the id from the user object of request
    });

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            errorMessage: errors.array()[0].msg
        })
    }

    product
        .save()
        .then(() => {
            console.log('Created Product');
            res.redirect('/');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req,res,next) => {
    const editMode = req.query.edit;
    if(!editMode){
        res.redirect('/');
    }

    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((result) => {
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                errorMessage: null,
                product: result
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req,res,next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    const updatedPrice = req.body.price;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            errorMessage: errors.array()[0].msg
        })
    }

    Product
        .findById(prodId)
        .then((product) => {
            if(product.userId.toString() !== req.user._id.toString()){
                return res.redirect('/');
            }
            product.title = updatedTitle,
            product.imageUrl = updatedImageUrl,
            product.description = updatedDesc,
            product.price = updatedPrice
            return product.save().then(() => {
                console.log('Updated Product');
                res.redirect('/admin/products');
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
};

exports.getProducts = (req,res,next) => {
    Product.find({userId: req.user._id})
        .then((products) => {
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                path: '/admin/products',
                prods: products
            });
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        })
}

exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    Product
        .deleteOne({_id: prodId, userId: req.user._id})
        .then(() => {
            console.log('Deleted Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            err.httpStatusCode = 500;
            return next(error);
        });
}