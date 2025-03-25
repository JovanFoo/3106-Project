const LeaveRequest = require( "../models/LeaveRequest" );
const Stylist = require( "../models/Stylist" );

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



    // Get all leave requests
    async getAllLeaveRequests ( req, res ) {
        console.log( "LeaveRequestController > get leave requests" );
        try
        {
            const { userId: managerId } = req;
            const manager = await Stylist.findById( managerId ).populate("stylists").exec();
            if ( !manager )
            {
                return res.status( 404 ).json( { message: "Manager not found" } );
            }
            if ( !(manager.stylists.length < 0) )
            {
                return res.status( 403 ).json( { message: "Not authorized" } );
            }
            manager.stylists.forEach( async ( stylist ) => { await stylist.populate( "leaveRequests" ).execPopulate(); } );
            
            const leaveRequests = manager.stylists.map( ( stylist ) => stylist.leaveRequests).flat();
            return res.status( 200 ).json( leaveRequests );
        } catch ( error )
        {
            console.log( error.message );
            return res.status( 400 ).json( { message: "Error getting leave requests" } );
        }
    },
    async getAllPendingLeaveRequests ( req, res ) {
        console.log( "LeaveRequestController > get leave requests" );
        try
        {
            const { userId: managerId } = req;
            const manager = await Stylist.findById( managerId ).populate( "stylists" ).exec();
            if ( !manager )
            {
                return res.status( 404 ).json( { message: "Manager not found" } );
            }
            if ( !( manager.stylists.length < 0 ) )
            {
                return res.status( 403 ).json( { message: "Not authorized" } );
            }
            manager.stylists.forEach( async ( stylist ) => { await stylist.populate( "leaveRequests" ).execPopulate(); } );
            
            const leaveRequests = manager.stylists.map( ( stylist ) => stylist.leaveRequests.filter(leaveRequest => leaveRequest.status == 'Pending') ).flat();
            return res.status( 200 ).json( leaveRequests );
        } catch ( error )
        {
            console.log( error.message );
            return res.status( 400 ).json( { message: "Error getting leave requests" } );
        }
    },
    async approveLeaveRequest ( req, res ) {
        console.log( "LeaveRequestController > approve leave request" );
        const { leaveRequestId } = req.params;
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
        const { leaveRequestId } = req.params;
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