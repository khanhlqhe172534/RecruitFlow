const Candidate = require("../models/candidate.model");
const Job = require("../models/job.model");
const Offer = require("../models/offer.model");
const Status = require("../models/status.model");

// 📌 1️⃣ Thống kê Number of candidates theo từng tháng
async function getCandidateTrend(req, res, next) {
  try {
    const pipeline = [
      {
        $project: {
          year: { $year: "$createdAt" }, // Lấy năm từ createdAt
          month: { $month: "$createdAt" } // Lấy tháng từ createdAt
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" }, // Gom nhóm theo cả năm và tháng
          count: { $sum: 1 } // Đếm Number of candidates theo từng tháng
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sắp xếp theo năm và tháng
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
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


// 📌 2️⃣ Thống kêAverage recruitment time theo tháng
async function getAvgHiringTimeTrend(req, res, next) {
  try {
    const pipeline = [
      {
        $match: {
          fullAt: { $exists: true, $ne: "" }, // Loại bỏ job không có fullAt hoặc bị rỗng
          number_of_vacancies: 0 // Chỉ lấy các job đã tuyển đủ người
        }
      },
      {
        $project: {
          year: { $year: "$createdAt" }, // Lấy năm từ createdAt
          month: { $month: "$createdAt" }, // Lấy tháng từ createdAt
          daysToHire: {
            $divide: [{ $subtract: ["$fullAt", "$createdAt"] }, 1000 * 60 * 60 * 24] // Tính số ngày từ createdAt đến fullAt
          }
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" }, // Gom nhóm theo cả năm và tháng
          avgDaysToHire: { $avg: "$daysToHire" } // Tính trung bình số ngày tuyển dụng
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // Sắp xếp theo năm rồi đến tháng
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          avgDaysToHire: { $round: ["$avgDaysToHire", 1] } // Làm tròn 1 chữ số thập phân
        }
      }
    ];

    const stats = await Job.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}


// 📌 3️⃣ Thống kê tỷ lệ chấp nhận offer theo tháng
async function getOfferStatusTrend(req, res, next) {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "status", // Join với bảng Status
          localField: "status",
          foreignField: "_id",
          as: "statusInfo",
        },
      },
      { $unwind: "$statusInfo" }, // Mở rộng dữ liệu để lấy tên status thay vì ID
      {
        $project: {
          year: { $year: "$createdAt" }, // Lấy năm từ createdAt
          month: { $month: "$createdAt" }, // Lấy tháng từ createdAt
          status: "$statusInfo.name", // Lấy tên status
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month", status: "$status" }, // Gom nhóm theo năm, tháng và trạng thái
          count: { $sum: 1 }, // Đếm số lượng offer theo từng trạng thái
        },
      },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" }, // Gom nhóm theo năm và tháng
          totalOffers: { $sum: "$count" }, // Tổng số offer trong tháng đó
          statusBreakdown: {
            $push: {
              status: "$_id.status",
              count: "$count"
            },
          },
        },
      },
      {
        $unwind: "$statusBreakdown" // Mở rộng để tính toán percentage
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalOffers: 1,
          statusBreakdown: {
            status: "$statusBreakdown.status",
            count: "$statusBreakdown.count",
            percentage: {
              $cond: {
                if: { $gt: ["$totalOffers", 0] }, // Tránh lỗi chia cho 0
                then: { $multiply: [{ $divide: ["$statusBreakdown.count", "$totalOffers"] }, 100] },
                else: 0,
              },
            },
          },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalOffers: { $first: "$totalOffers" },
          statusBreakdown: { $push: "$statusBreakdown" }
        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalOffers: 1,
          statusBreakdown: 1,
        },
      },
      { $sort: { year: 1, month: 1 } }, // Sắp xếp theo thời gian
    ];

    const stats = await Offer.aggregate(pipeline);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}


// 📌 4️⃣ Thống kê Number of candidates theo trạng thái (có thêm status name)
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

async function getJobCount(req, res, next) {
  try {
    const jobCount = await Job.countDocuments({});
    res.status(200).json(jobCount);
  } catch (error) {
    next(error);
  }
}

async function getCandidateCount(req, res, next) {
  try {
    const candidateCount = await Candidate.countDocuments({});
    res.status(200).json(candidateCount);
  } catch (error) {
    next(error);
  }
}

async function getOfferAcceptanceRate(req, res, next) {
  try {
    // Get the ObjectId of the "accept" status
    const acceptStatus = await Status.findOne({ name: "accept" });

    if (!acceptStatus) {
      return res.status(400).json({ message: "Status 'accept' not found" });
    }

    // Count the total number of offers
    const totalOffers = await Offer.countDocuments({});
    
    // Count the number of accepted offers
    const acceptedOffers = await Offer.countDocuments({
      status: acceptStatus._id // Compare with the ObjectId of the "accept" status
    });

    // Calculate the acceptance rate
    const acceptanceRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;

    // Respond with the acceptance rate
    res.status(200).json({ acceptanceRate });
  } catch (error) {
    // Pass the error to the next middleware
    next(error);
  }
}

// 📌 Gộp tất cả API vào controller
const statsController = {
  getCandidateTrend,
  getAvgHiringTimeTrend,
  getOfferStatusTrend,
  getCandidateStatusStats,
  getJobCount,
  getCandidateCount,
  getOfferAcceptanceRate
};

module.exports = statsController;
