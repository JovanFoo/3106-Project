const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        manager:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", required: true
        }
        ,
        stylists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Stylist",
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
