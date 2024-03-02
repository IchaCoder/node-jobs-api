const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { NotFoundError, BadRequestError } = require("../errors");

const getAllJobs = async (req, res) => {
	const jobs = await Job.find({ createdBy: req.user.userId }).sort("createdAt");
	res.status(StatusCodes.OK).json({ jobs, status: "success" });
};

const getJob = async (req, res) => {
	const { userId } = req.user;
	const { id: jobId } = req.params;

	const job = await Job.findById({ _id: jobId, createdBy: userId });

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId}`);
	}
	res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
	req.body.createdBy = req.user.userId;
	const job = await Job.create(req.body);
	res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
	const {
		body: { company, position },
		user: { userId },
		params: { id: jobId },
	} = req;

	if (!company || !position) {
		throw new BadRequestError("Please provide company or position");
	}

	const job = await Job.findByIdAndUpdate({ _id: jobId, createdBy: userId }, req.body, {
		new: true,
		runValidator: true,
	});

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId}`);
	}
	res.status(StatusCodes.OK).json({ job, status: "success" });
};

const deleteJob = async (req, res) => {
	const {
		user: { userId },
		params: { id: jobId },
	} = req;

	const job = await Job.findByIdAndRemove({ _id: jobId, createdBy: userId });

	if (!job) {
		throw new NotFoundError(`No job with id ${jobId}`);
	}
	res.status(StatusCodes.OK).send("Job deleted");
};

module.exports = { getAllJobs, getJob, createJob, updateJob, deleteJob };
