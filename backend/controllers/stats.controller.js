const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");
const Offer = require("../models/offer.model");

// 📌 1️⃣ Thống kê số lượng ứng viên theo từng tháng
async function getCandidateTrend(req, res, next) {
  try {
    const pipeline = [
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          count: 1,
        },
      },
    ];

    const stats = await Candidate.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

// 📌 2️⃣ Thống kê thời gian trung bình tuyển dụng theo tháng
async function getAvgHiringTimeTrend(req, res, next) {
  try {
    const pipeline = [
      { $match: { number_of_vacancies: 0 } },
      {
        $project: {
          month: { $month: "$createdAt" },
          daysToHire: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60 * 24],
          },
        },
      },
      {
        $group: {
          _id: "$month",
          avgDaysToHire: { $avg: "$daysToHire" },
        },
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id: 0,
          month: "$_id",
          avgDaysToHire: 1,
        },
      },
    ];

    const stats = await Job.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

// 📌 3️⃣ Thống kê tỷ lệ chấp nhận offer theo tháng
async function getOfferAcceptanceTrend(req, res, next) {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          total: { $sum: "$count" },
          accepted: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "accept"] }, "$count", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          acceptanceRate: {
            $multiply: [{ $divide: ["$accepted", "$total"] }, 100],
          },
        },
      },
      { $sort: { month: 1 } },
    ];

    const stats = await Offer.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

// 📌 4️⃣ Thống kê số lượng ứng viên theo trạng thái (có thêm status name)
async function getCandidateStatusStats(req, res, next) {
  try {
    const pipeline = [
      { $group: { _id: "$status", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "status",
          localField: "_id",
          foreignField: "_id",
          as: "statusDetails"
        }
      },
      { $unwind: "$statusDetails" },
      {
        $project: {
          _id: 1,
          statusName: "$statusDetails.name",
          count: 1
        }
      }
    ];
    const stats = await Candidate.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}

// 📌 5️⃣ Gộp tất cả API vào controller
const statsController = {
  getCandidateTrend,
  getAvgHiringTimeTrend,
  getOfferAcceptanceTrend,
  getCandidateStatusStats,
};

module.exports = statsController;
