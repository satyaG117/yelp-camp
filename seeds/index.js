const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelp-camp");
}

const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
}


const selectRandomUser = () => {
  const userIds = ["630c66df0ce8b692965122b8", "630cf514a940add50cd12fcd", "630ccf72c8852167e8c3ee24"];
  const randomIndex = Math.floor(Math.random() * 3);
  return userIds[randomIndex];

}

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 40; i++) {
    const randomSelect = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 5000);
    const camp = new Campground({
      author: selectRandomUser(),
      location: `${cities[randomSelect].city} , ${cities[randomSelect].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aliquid quos, possimus ducimus expedita autem minus, atque doloremque commodi, architecto maiores ea incidunt iste numquam? Consectetur blanditiis nam rerum alias non minima ipsum dolorum temporibus adipisci! Nam, sequi voluptatibus. Aspernatur dolorum officiis aperiam beatae repellendus, amet ipsam sit nisi velit quibusdam.',
      price: price,
      geometry : {
        type : "Point",
        coordinates : [
          cities[randomSelect].longitude,
          cities[randomSelect].latitude,
        ]
      },
      images: [
        {
          "url": "https://res.cloudinary.com/cloud7xsg/image/upload/v1662625715/YelpCamp/le09akdckeajxougasuy.jpg",
          "filename": "Yelpcamp/le09akdckeajxougasuy"
        },
        {
          "url": "https://res.cloudinary.com/cloud7xsg/image/upload/v1662627261/YelpCamp/b2mbawtd3exvqjo0ejzx.jpg",
          "filename": "YelpCamp/b2mbawtd3exvqjo0ejzx"
        }
      ]
    });
    await camp.save();
  }
};

seedDB()
  .then(() => {
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log("ERROR : ", err);
  })
