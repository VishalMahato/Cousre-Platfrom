const { Course } = require("../models/course.model.js");
const { z } = require("zod");

/**
 * Handles course creation
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @returns {Promise<void>}
 */
const createCourse = async (req, res) => {
    // Define schema using Zod
    const courseSchema = z.object({
        courseName: z.string().min(1, "Course name is required"),
        courseDescription: z.string().min(1, "Course description is required"),
        coursePrice: z.number().positive("Course price must be a positive number"),
    });

    try {
        // Validate request body using Zod
        const validatedData = courseSchema.parse(req.body);

        // Get creator (user) ID from the request (assuming the user is authenticated and _id is attached to req.user)
        const { _id } = req.user;

        // Create new course
        const newCourse = new Course({
            courseName: validatedData.courseName,
            creatorId: _id,
            courseDescription: validatedData.courseDescription,
            coursePrice: validatedData.coursePrice,
        });

        // Save the new course
        await newCourse.save();

        // Send a response to the client
        return res.status(201).json({
            message: "Course created successfully",
            course: newCourse,
        });
    } catch (error) {
        if (error.name === "ZodError") {
            // Handle validation errors
            return res.status(400).json({
                message: "Validation error",
                errors: error.errors,
            });
        }

        // Handle other errors
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

module.exports = { createCourse };
