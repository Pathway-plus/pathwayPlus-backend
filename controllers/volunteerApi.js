const Volunteer = require("../models/volunteer");
const { StatusCodes } = require("http-status-codes");

//get all volunteer
const getAllVolunteer = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const volunteers = await Volunteer.find()
    .skip(skip)
    .limit(limit)
    .clone()
    .catch((error) => {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
    });

  //get total count of volunteers from db
  const totalVolunteers = await Volunteer.countDocuments({});

  res
    .status(StatusCodes.OK)
    .json({ volunteers: volunteers, total: totalVolunteers });
};

const getVolunteerList = async (req, res) => {
  try {
    const pageNumber = parseInt(req.params.pagenumber);
    const limit = Number(req.query.limit) || 10;
    const total = await Volunteer.count({});
    if (total <= 0) {
      res.status(404).send("No volunteer was found, please create one!");
    }
    const totalPages = Math.ceil(total / limit);
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > totalPages) {
      pageNumber = totalPages;
    }

    const startIndex = (pageNumber - 1) * limit;
    const endIndex = pageNumber * limit;
    const volunteers = await Volunteer.find().skip(startIndex).limit(limit);

    res.send({
      volunteers: volunteers,
      currentPage: pageNumber,
      total: total,
      totalPages: totalPages,
      hasNextPage: endIndex < total,
      hasPreviousPage: startIndex > 0,
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

//get single volunteer
const getSingleVolunteer = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errorMsg: "id query not found" });
  }
  const volunteer = await Volunteer.findById(id)
    .clone()
    .catch((error) => {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
    });
  res.status(StatusCodes.OK).json(volunteer);
};

//post new volunteer
const postVolunteer = async (req, res) => {
  await Volunteer.create(req.body)
    .then((volunteer) => {
      res.status(StatusCodes.CREATED).json(volunteer);
    })
    .catch((error) =>
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error })
    );
};

//update single volunteer with id parameter
const updateVolunteer = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errorMsg: "id query not found" });
  }
  const result = await Volunteer.findByIdAndUpdate(id, req.body)
    .clone()
    .catch(function (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
    });
  res.status(StatusCodes.OK).json(result);
};

//delete single volunteer with id path parameter
const deleteVolunteer = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ errorMsg: "id query not found" });
  }

  const result = await Volunteer.findByIdAndDelete(id)
    .clone()
    .catch(function (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error });
    });

  res.status(StatusCodes.OK).json(result);
};

module.exports = {
  postVolunteer,
  updateVolunteer,
  getAllVolunteer,
  getSingleVolunteer,
  deleteVolunteer,
  getVolunteerList,
};
