// From https://github.com/alenia/aqiduck
import calculateAQI from '../src/calculateAQI'
import { expect } from 'chai'

test("It turns raw PM 2.5 numbers into AQI", () => {
  expect(calculateAQI(6).AQI).to.equal(25);
  expect(calculateAQI(6).category).to.equal("Good");
  expect(calculateAQI(6).colorRGB).to.equal("rgb(128,242,0)");
  expect(calculateAQI(12).AQI).to.equal(50);
  expect(calculateAQI(12).category).to.equal("Good");
  expect(calculateAQI(12).colorRGB).to.equal("rgb(255,255,0)");
  expect(calculateAQI(12).colorHex).to.equal("#ffff00");
  expect(calculateAQI(20).AQI).to.equal(68);
  expect(calculateAQI(20).category).to.equal("Moderate");
  expect(calculateAQI(20).colorRGB).to.equal("rgb(255,211,0)");
  expect(calculateAQI(35.46).AQI).to.equal(100);
  expect(calculateAQI(35.46).category).to.equal("Moderate");
  expect(calculateAQI(35.46).colorRGB).to.equal("rgb(255,126,0)");
  expect(calculateAQI(40).AQI).to.equal(112);
  expect(calculateAQI(40).category).to.equal("Unhealthy for Sensitive Groups");
  expect(calculateAQI(40).colorRGB).to.equal("rgb(255,98,0)");
  expect(calculateAQI(80).AQI).to.equal(164);
  expect(calculateAQI(80).category).to.equal("Unhealthy");
  expect(calculateAQI(80).colorRGB).to.equal("rgb(229,0,20)");
  expect(calculateAQI(200).AQI).to.equal(250);
  expect(calculateAQI(200).category).to.equal("Very Unhealthy");
  expect(calculateAQI(300).AQI).to.equal(350);
  expect(calculateAQI(300).category).to.equal("Hazardous");
  expect(calculateAQI(300).colorRGB).to.equal("rgb(126,0,35)");
  expect(calculateAQI(400).AQI).to.equal(434);
  expect(calculateAQI(600).AQI).to.equal(600); // Return raw PM when above 500
  expect(calculateAQI(600).category).to.equal("Unknown");
  expect(calculateAQI(600).colorRGB).to.equal("rgb(66,0,33)");
  expect(calculateAQI(600).colorHex).to.equal("#420021");
});
