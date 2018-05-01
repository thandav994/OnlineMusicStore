var express = require('express')
var router = express.Router();

var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Category = require('../models/category')

/*
Get Category index
*/
router.get('/', isAdmin, function(req, res) {
	Category.find(function(err, categories){
		if(err) 
			return console.log(err);
		res.render('admin/categories',{
			categories: categories
		});
	});
});

/*
 Get add category
*/
router.get('/add-category', isAdmin, function(req,res){
	var title = "";
	var slug = "";

	res.render('admin/add_category',{
		title: title,
		slug: slug
	});
});

/*
 Post add category
*/
router.post('/add-category', isAdmin, function(req,res){
	
	req.checkBody('title','Title must have a value.').notEmpty();

	var title = req.body.title;
	var slug = title.replace(/\s+/g, '-').toLowerCase();

	var errors = req.validationErrors();
	if(errors){
		console.log('errors')
		res.render('admin/add_page',{
			errors : errors,
			title: title
		}); 
	} else {
		Category.findOne({slug : slug}, function(err, cat){
			if(cat){
				req.flash('danger', 'Category title exists, choose another');
				res.render('admin/add_category',{
				title: title
				}); 
			} else{
				var cat = new Category({
					title : title,
					slug:slug
				});

				cat.save(function(err){
					if(err) return console.log(error);
					// Get all pages to pass to header.ejs
					Category.find(function(err, categories){
							if(err){
								console.log(err);
							} else{
								req.app.locals.categories = categories;
							}
						});
					req.flash('success', 'Category added!');
					res.redirect('/admin/categories');

				});
			}
		});
	}
});

// Get edit category
router.get('/edit-category/:id', isAdmin, function(req,res){
	
	Category.findOne({_id: req.params.id}, function(err, cat){
		if(err) 
			return console.log(err);
		res.render('admin/edit_category',{
			title: cat.title,
			id: cat._id
		});
	});
});


// Post edit category
router.post('/edit-category/:id',  function(req,res){
	
	req.checkBody('title','Title must have a value.').notEmpty();

	var title = req.body.title;
	var slug = title.replace(/\s+/g, '-').toLowerCase();
	var id = req.params.id;

	var errors = req.validationErrors();
	if(errors){
		console.log('errors')
		res.render('admin/edit_category',{
			errors : errors,
			title: title,
			id: id
		}); 
	} else {
		Category.findOne({slug : slug, _id:{'$ne':id}}, function(err, cat){
			if(cat){
				req.flash('danger', 'Category title exists, choose another!');
				res.render('admin/edit_category',{
				title: title,
				slug: slug,
				id: id
				}); 
			} else{
				Category.findById(id, function(err, cat){
					if(err) 
						return console.log(err);
					
					cat.title = title;
					cat.slug = slug;

					cat.save(function(err){
					if(err) 
						return console.log(error);

					Category.find(function(err, categories){
							if(err){
								console.log(err);
							} else{
								req.app.locals.categories = categories;
							}
						});
					req.flash('success', 'Category edited!');
					res.redirect('/admin/categories/edit-category/'+id);
					});
				});
			}
		});
	}
});


// Get delete category
router.get('/delete-category/:id', isAdmin, function(req, res){
	Category.findByIdAndRemove(req.params.id, function(err){
		if(err) 
			return console.log(err);
		Category.find(function(err, categories){
			if(err){
				console.log(err);
			} else{
				req.app.locals.categories = categories;
			}
		});
		req.flash('success', 'Category deleted');
		res.redirect('/admin/categories/');
	});
});

//Exports
module.exports = router;