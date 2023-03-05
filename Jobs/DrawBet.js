const Admin = require("../models/Admin")
const Bet = require("../models/Bet")
const Placements = require("../models/Placements")
const User = require("../models/User")
const Winner = require("../models/Winner")
const schedule = require('node-schedule');
const { sendNotificationsToTopic } = require("../utils/notifications")
const { firebaseTopics } = require("../utils/firebaseTopics")

const drawBet = async (req, res, next) => {
  try {
    let bets = await Bet.find({ status: 'ongoing', spotsLeft: { $size: 0 } })
    let admin = await Admin.find()
    if (bets.length > 0) {
      for (let i = 0; i < bets.length; i++) {
        let singleBet = bets[i]
        if (singleBet.spotsTaken.length === 100) {
          let resObj = await pickWinners(singleBet)
          let firstPrize = (parseInt(singleBet.gameType) * 100 * 50) / 100
          let secondPrize = (parseInt(singleBet.gameType) * 100 * 20) / 100
          let thirdPrize = (parseInt(singleBet.gameType) * 100 * 15) / 100
          let fourthPrize = (parseInt(singleBet.gameType) * 100 * 5) / 100
          let adminProfit = (parseInt(singleBet.gameType) * 100 * 10) / 100

          let result = await Promise.all(
            [User.findOneAndUpdate({ _id: resObj.winners[0] }, { $inc: { balance: firstPrize }, $push: { balanceHistory: { cashValue: firstPrize, direction: 'inbound' } } })],
            [User.findOneAndUpdate({ _id:resObj.winners[1] }, { $inc: { balance: secondPrize }, $push: { balanceHistory: { cashValue: secondPrize, direction: 'inbound' } } })],
            [User.findOneAndUpdate({ _id: resObj.winners[2] }, { $inc: { balance: thirdPrize }, $push: { balanceHistory: { cashValue: thirdPrize, direction: 'inbound' } } })],
            [User.findOneAndUpdate({ _id: resObj.winners[3] }, { $inc: { balance: fourthPrize }, $push: { balanceHistory: { cashValue: fourthPrize, direction: 'inbound' } } })],
            [Admin.findOneAndUpdate({ _id: admin[0]._id }, { $inc: { totalEarned: adminProfit } })],
          )
          let winner = new Winner({
            firstPosition: resObj.winners[0]._id,
            firstPrize,
            secondPosition: resObj.winners[1]._id,
            secondPrize,
            thirdPosition: resObj.winners[2]._id,
            thirdPrize,
            fourthPosition: resObj.winners[3]._id,
            fourthPrize,
            betId: singleBet._id
          })
          let savedWinner = await winner.save()
          let updateBet = await Bet.findOneAndUpdate({ _id: singleBet._id }, { winnerId: savedWinner._id, status: 'announced', winningNumbers: resObj.winningNumbers },{new:true})
          let notification = {
            title: 'Bet Announced',
            body: `${updateBet.gameTitle}`
        }
        sendNotificationsToTopic(notification , firebaseTopics.sendToAll)
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
    if(singleBet.fixes.length>0){
      for(let m=0 ; m<singleBet.fixes.length ; m++){
        if(singleBet.fixes[m].position && singleBet.fixes[m].position === 'first') pickedNumbers[0]
        if(singleBet.fixes[m].position && singleBet.fixes[m].position === 'second') pickedNumbers[1]
        if(singleBet.fixes[m].position && singleBet.fixes[m].position === 'third') pickedNumbers[2]
        if(singleBet.fixes[m].position && singleBet.fixes[m].position === 'fourth') pickedNumbers[3]
      }
    }
    let firstPositionNumber = pickedNumbers[0]
    let secondPositionNumber = pickedNumbers[1]
    let thirdPositionNumber = pickedNumbers[2]
    let fourthPositionNumber = pickedNumbers[3]

    let firstPosition = await Placements.findOne({ numbers: firstPositionNumber, betId: bet._id }).populate('userId')
    let secondPosition = await Placements.findOne({ numbers: secondPositionNumber, betId: bet._id }).populate('userId')
    let thirdPosition = await Placements.findOne({ numbers: thirdPositionNumber, betId: bet._id }).populate('userId')
    let fourthPosition = await Placements.findOne({ numbers: fourthPositionNumber, betId: bet._id }).populate('userId')

    return {
      winners: [firstPosition.userId, secondPosition.userId, thirdPosition.userId, fourthPosition.userId],
      winningNumbers: pickedNumbers
    }
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