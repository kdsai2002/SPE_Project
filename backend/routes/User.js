const router = require('express').Router();
let moment = require('moment');
let Buyer = require('../models/Buyer');
let Vendor = require('../models/Vendor');
require('dotenv').config();

router.route("/info").post(async (req, res) => {
    res.send(req.usertoken); 
});
router.route("/profile").post(async (req, res) => {
    let usertoken = req.usertoken;
    let user; 
    if (usertoken.type == "buyer") {
        user = await Buyer.findOne({email: usertoken.email});
    }
    else {
        user = await Vendor.findOne({email: usertoken.email});
    }
    res.status(200).json(user);
})
router.route("/update").post(async (req, res) => {
    let user = req.body;
    if (user.email !== user.old_email) {
        let duplicatebuyer = await Buyer.findOne({email: user.email});
        let duplicatevendor = await Vendor.findOne({email: user.email});
        if (duplicatebuyer || duplicatevendor) {
            return res.status(200).json({
                status: 1,
                error: "The email you've entered is already registered"
            });
        }
    }
    if (user.type === "buyer") {
        Buyer.findOne({email: user.old_email})
            .then(buyer => {
            buyer.name = user.name;
            buyer.email = user.email;
            buyer.age = user.age;
            buyer.batch_name = user.batch_name;
            buyer.contact_number = user.contact_number;

            buyer.save()
                .then(() => res.json('Buyer updated!'))
                .catch(err => res.status(200).json('Error: ' + err));
            })
            .catch(err => res.status(200).json('Error: ' + err));
    }
    else if (user.type === "vendor") {
        if (user.shop_name !== user.old_shop_name) {
            let duplicateVendor = await Vendor.findOne({shop_name: user.shop_name});
            if (duplicateVendor) {
                return res.status(200).json({
                    status: 1,
                    error: "A shop already exists with that name"
                });
            }

        }
        const canteen_timings = {
            open: moment(user.opentiming).format("HH:mm"),
            close: moment(user.closetiming).format("HH:mm")
        }
        Vendor.findOne({email: user.old_email})
            .then(vendor => {
            vendor.name = user.name;
            vendor.shop_name = user.shop_name;
            vendor.email = user.email;
            vendor.contact_number = user.contact_number;
            vendor.canteen_timings = canteen_timings || vendor.canteen_timings;
            vendor.save()
                .then(() => res.json({
                    status: 0
                }))
                .catch(err => res.status(200).json({
                    status: 1,
                    error: err
                }));
            })
            .catch(err => res.status(200).json({
                status: 1,
                error: err
            }));
    }
})
router.route("/wallet/update").post(async (req, res) => {
    let usertoken = req.usertoken;
    if (usertoken.type === "vendor") {
        return res.status(200).json({
            status: 1,
            error: "Vendors do not have wallets"
        })
    }
    let user = await Buyer.findOne({email: usertoken.email});
    if (!user) {
        return res.status(200).json({
            status: 1,
            error: "Unable to find user"
        })
    }
    let delta = req.body.wallet;
    if (delta + user.wallet < 0) {
        return res.status(200).json({
            status: 1,
            error: "Insufficient balance"
        })
    }
    user.wallet += delta;
    user.save()
        .then(() => res.json({
            status: 0,
        }))
        .catch(err => res.status(200).json({
            status: 1,
            error: err
        }))

})
module.exports = router;






