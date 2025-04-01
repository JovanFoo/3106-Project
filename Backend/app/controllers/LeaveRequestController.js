const LeaveRequest = require( "../models/LeaveRequest" );
const Stylist = require( "../models/Stylist" );
const mongodb = require("./config/database.js");

const LeaveRequestController = {
    async createLeaveRequest ( req, res ) {
        console.log( "LeaveRequestController > create leave request" );
        const { startDate, endDate, reason } = req.body;
        const { userId: stylistId } = req;
        const stylist = await Stylist.findById( stylistId );
        if ( !stylist ) return res.status( 404 ).json( { message: "Stylist not found" } );
        const newLeaveRequest = new LeaveRequest( {
            stylist: stylistId,
            startDate,
            endDate,
            reason,
        } );
        try
        {
            await newLeaveRequest.save();
            stylist.leaveRequests.push( newLeaveRequest );
            await stylist.save();
            return res.status( 201 ).json( newLeaveRequest );
        } catch ( error )
        {
            console.log( error.message );
            return res.status( 400 ).json( { message: error.message } );
        }
    },
    async getMyLeaveRequests ( req, res ) {
        console.log( "LeaveRequestController > get my leave requests" );
        const { userId: stylistId } = req;
        const stylist = await Stylist
            .findById( stylistId )

            .populate( "leaveRequests" )
            .exec();
        if ( !stylist )
        {
            return res.status( 404 ).json( { message: "Stylist not found" } );
        }
        return res.status( 200 ).json( stylist.leaveRequests );
    },
    async update ( req, res ) {
        console.log( "LeaveRequestController > update leave request" );
        const { id } = req.params;
        const { startDate, endDate, reason } = req.body;
        const { userId: stylistId } = req;
        const stylist = await Stylist.findById( stylistId ).populate( "leaveRequests" ).exec();
        if ( !stylist ) return res.status( 404 ).json( { message: "Stylist not found" } );
        const leaveRequest = stylist.leaveRequests.find( ( leaveRequest ) => leaveRequest._id == id );
        if ( !leaveRequest ) return res.status( 404 ).json( { message: "Leave request not found" } );
        if ( leaveRequest.status != "Pending" ) return res.status( 400 ).json( { message: "Leave request is already " + leaveRequest.status } );
        leaveRequest.startDate = startDate;
        leaveRequest.endDate = endDate;
        leaveRequest.reason = reason;
        try
        {
            await leaveRequest.save();
            return res.status( 200 ).json( leaveRequest );
        } catch ( error )
        {
            console.log( error.message );
            return res.status( 400 ).json( { message: error.message } );
        }
    },
    async delete ( req, res ) {
        console.log( "LeaveRequestController > delete leave request" );
        const { id } = req.params;
        const { userId: stylistId } = req;
        const stylist = await Stylist
            .findById( stylistId )
            .populate( "leaveRequests" )
            .exec();
        if ( !stylist ) return res.status( 404 ).json( { message: "Stylist not found" } );
        const leaveRequest = stylist.leaveRequests.find( ( leaveRequest ) => leaveRequest._id == id );
        if ( !leaveRequest ) return res.status( 404 ).json( { message: "Leave request not found" } );
        if ( leaveRequest.status != "Pending" ) return res.status( 400 ).json( { message: "Leave request is already " + leaveRequest.status } );
        try
        {
            await leaveRequest.remove();
            return res.status( 200 ).json( leaveRequest );
        } catch ( error )
        {
            console.log( error.message );
            return res.status( 400 ).json( { message: error.message } );
        }
    },


    // Get all leave requests
    // Get all leave requests
  async getAllLeaveRequests(req, res) {
    console.log("LeaveRequestController > get leave requests");
    try {
      const { userId: managerId } = req;
      const manager = await Stylist.findById(managerId)
        .populate("stylists")
        .populate("leaveRequests")
        .exec();
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
      if (manager.stylists.length === 0) {
        return res
          .status(403)
          .json({ message: "Not authorized - No stylists under management" });
      }

      // Populate leave requests for all stylists
      await Promise.all(
        manager.stylists.map(async (stylist) => {
          await stylist.populate("leaveRequests");
        })
      );

      const leaveRequests = manager.stylists
        .map((stylist) => stylist.leaveRequests)
        .flat();
      return res.status(200).json([...leaveRequests, ...manager.leaveRequests]);
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({ message: "Error getting leave requests" });
    }
  },
    async getAllPendingLeaveRequests ( req, res ) {
        console.log( "LeaveRequestController > get pending leave requests" );
        try {
            const managerId = req.user?.id ||  req.userId || req.body.userId;
            console.log("Fetching manager with ID:", managerId);
            
            const manager = await Stylist.findById(managerId)
                .populate({
                    path: 'stylists',
                    select: '_id name email profilePicture'
                });
            
            if (!manager) {
                console.log("Manager not found");
                return res.status(404).json({ message: "Manager not found" });
            }

            console.log("Manager has stylists:", manager.stylists?.length || 0);

            // Get all pending leave requests from all stylists
            const leaveRequests = [];
            if (manager.stylists && manager.stylists.length > 0) {
                for (const stylist of manager.stylists) {
                    try {
                        console.log("Fetching pending leave requests for stylist:", stylist._id);
                        const stylistWithRequests = await Stylist.findById(stylist._id)
                            .populate({
                                path: 'leaveRequests',
                                select: '_id startDate endDate status reason type'
                            });
                        
                        if (stylistWithRequests && stylistWithRequests.leaveRequests) {
                            const pendingRequests = stylistWithRequests.leaveRequests.filter(
                                request => request.status === 'Pending'
                            );
                            
                            if (pendingRequests.length > 0) {
                                console.log("Stylist has pending leave requests:", pendingRequests.length);
                                // Add stylist info to each leave request
                                const requestsWithStylist = pendingRequests.map(request => ({
                                    ...request.toObject(),
                                    stylist: {
                                        _id: stylist._id,
                                        name: stylist.name,
                                        email: stylist.email,
                                        profilePicture: stylist.profilePicture
                                    }
                                }));
                                leaveRequests.push(...requestsWithStylist);
                            } else {
                                console.log("Stylist has no pending leave requests");
                            }
                        }
                    } catch (stylistError) {
                        console.error("Error processing stylist:", stylist._id, stylistError);
                        // Continue with next stylist even if one fails
                        continue;
                    }
                }
            } else {
                console.log("Manager has no stylists assigned");
                // Return empty array with 200 status code
                return res.status(200).json([]);
            }

            console.log(`Found ${leaveRequests.length} pending leave requests`);
            return res.status(200).json(leaveRequests);
        } catch (error) {
            console.error("Error in getAllPendingLeaveRequests:", error);
            console.error("Error stack:", error.stack);
            return res.status(500).json({ 
                message: "Error getting pending leave requests",
                error: error.message,
                stack: error.stack
            });
        }
    },
    async approveLeaveRequest ( req, res ) {
        console.log( "LeaveRequestController > approve leave request" );
        const { id:leaveRequestId } = req.params;
        const { userId: managerId } = req;
        const manager = await Stylist.findById( managerId );
        manager.populate("stylists");
        manager.stylists.forEach(async (stylist) => {
          await stylist.populate("leaveRequests").execPopulate();
        });
        const consists = manager.stylists
          .map((stylist) => stylist.leaveRequests)
          .flat()
          .some((leaveRequest) => leaveRequest._id == leaveRequestId);
        if (!consists) {
          return res.status(403).json({ message: "Stylist not under manager" });
        }
        if ( !manager )
        {
            return res.status( 404 ).json( { message: "Manager not found" } );
        }
        const leaveRequest = await LeaveRequest.findById( leaveRequestId );
        if ( !leaveRequest )
        {
            return res.status( 404 ).json( { message: "Leave request not found" } );
        }
        if ( leaveRequest.status != "Pending" )
        {
            return res.status( 400 ).json( { message: "Leave request is already " + leaveRequest.status } );
        }
        leaveRequest.status = "Approved";
        leaveRequest.approvedBy = manager;
        await leaveRequest.save();
        return res.status( 200 ).json( leaveRequest );
    },
    async rejectLeaveRequest ( req, res ) {
        console.log( "LeaveRequestController > reject leave request" );
        const { id: leaveRequestId } = req.params;
        const { userId: managerId } = req;
        const manager = await Stylist.findById( managerId );
        manager.populate("stylists");
        manager.stylists.forEach(async (stylist) => {
          await stylist.populate("leaveRequests").execPopulate();
        });
        const consists = manager.stylists
          .map((stylist) => stylist.leaveRequests)
          .flat()
          .some((leaveRequest) => leaveRequest._id == leaveRequestId);
        if (!consists) {
          return res.status(403).json({ message: "Stylist not under manager" });
        }
        if ( !manager )
        {
            return res.status( 404 ).json( { message: "Manager not found" } );
        }
        const leaveRequest = await LeaveRequest.findById( leaveRequestId );
        if ( !leaveRequest )
        {
            return res.status( 404 ).json( { message: "Leave request not found" } );
        }
        if ( leaveRequest.status != "Pending" )
        {
            return res.status( 400 ).json( { message: "Leave request is already " + leaveRequest.status } );
        }
        leaveRequest.status = "Rejected";
        leaveRequest.approvedBy = manager;
        await leaveRequest.save();
        return res.status( 200 ).json( leaveRequest );
    },
};

module.exports = LeaveRequestController;