const Admin = require("../models/Admin")
const Bet = require("../models/Bet")
const Placements = require("../models/Placements")
const User = require("../models/User")
const Winner = require("../models/Winner")
const schedule = require('node-schedule');

const drawBet = async (req, res, next) => {
  try {
    let bets = await Bet.find({ status: 'ongoing', spotsLeft: { $size: 0 } })

    let admin = await Admin.find()
    if (bets.length > 0) {
      for (let i = 0; i < bets.length; i++) {
        let singleBet = bets[i]
        if (singleBet.spotsTaken.length === 100) {
          let winners = await pickWinners(singleBet)
          let firstPrize = (parseInt(singleBet.gameType) * 100 * 50) / 100
          let secondPrize = (parseInt(singleBet.gameType) * 100 * 20) / 100
          let thirdPrize = (parseInt(singleBet.gameType) * 100 * 15) / 100
          let fourthPrize = (parseInt(singleBet.gameType) * 100 * 5) / 100
          let adminProfit = (parseInt(singleBet.gameType) * 100 * 10) / 100

          let result = await Promise.all(
            [User.findOneAndUpdate({ _id: winners[0] }, { $inc: { balance: firstPrize } })],
            [User.findOneAndUpdate({ _id: winners[1] }, { $inc: { balance: secondPrize } })],
            [User.findOneAndUpdate({ _id: winners[2] }, { $inc: { balance: thirdPrize } })],
            [User.findOneAndUpdate({ _id: winners[3] }, { $inc: { balance: fourthPrize } })],
            [Admin.findOneAndUpdate({ _id: admin[0]._id }, { $inc: { totalEarned: adminProfit } })],
          )
          let winner = new Winner({
            firstPosition: winners[0]._id,
            firstPrize,
            secondPosition: winners[1]._id,
            secondPrize,
            thirdPosition: winners[2]._id,
            thirdPrize,
            fourthPosition: winners[3]._id,
            fourthPrize,
            betId: singleBet._id
          })
          let savedWinner = await winner.save()
          let updateBet = await Bet.findOneAndUpdate({ _id: singleBet._id }, { winnerId: savedWinner._id })
        }
      }
    }
  }
  catch (err) {
    console.log(err, " :err")
  }
}

function pickRandomNumbers() {
  const numbers = [];
  while (numbers.length < 4) {
    const randomNum = Math.floor(Math.random() * 100) + 1;
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }
  return numbers;
}

async function pickWinners(bet) {
  try {
    let pickedNumbers = pickRandomNumbers()
    let firstPositionNumber = pickedNumbers[0]
    let secondPositionNumber = pickedNumbers[1]
    let thirdPositionNumber = pickedNumbers[2]
    let fourthPositionNumber = pickedNumbers[3]

    let firstPosition = await Placements.findOne({ numbers: firstPositionNumber, betId: bet._id }).populate('userId')
    let secondPosition;
    secondPosition = await Placements.findOne({ numbers: secondPositionNumber, betId: bet._id }).populate('userId')
    while (firstPosition.userId._id === secondPosition.userId._id) {
      let numbers = pickRandomNumbers()
      secondPositionNumber = numbers[0]
      secondPosition = await Placements.findOne({ numbers: secondPositionNumber, betId: bet._id }).populate('userId')
    }
    let thirdPosition;
    thirdPosition = await Placements.findOne({ numbers: thirdPositionNumber, betId: bet._id }).populate('userId')
    while (firstPosition.userId._id === thirdPosition.userId._id || secondPosition.userId._id === thirdPosition.userId._id) {
      let numbers = pickRandomNumbers()
      thirdPositionNumber = numbers[0]
      thirdPosition = await Placements.findOne({ numbers: thirdPositionNumber, betId: bet._id }).populate('userId')
    }
    let fourthPosition;
    fourthPosition = await Placements.findOne({ numbers: fourthPositionNumber, betId: bet._id }).populate('userId')
    while (firstPosition.userId._id === fourthPosition.userId._id || secondPosition.userId._id === fourthPosition.userId._id || thirdPosition.userId._id === fourthPosition.userId._id) {
      let numbers = pickRandomNumbers()
      fourthPositionNumber = numbers[0]
      fourthPosition = await Placements.findOne({ numbers: fourthPositionNumber, betId: bet._id }).populate('userId')
    }
    return [firstPosition.userId, secondPosition.userId, thirdPosition.userId, fourthPosition.userId]
  }
  catch (err) {
    console.log(err, " :error")
  }
}

exports.checkDrawingBets = () => {
  schedule.scheduleJob('*/5 * * * *', function () {
    console.log('job started')
    drawBet()
  });
}