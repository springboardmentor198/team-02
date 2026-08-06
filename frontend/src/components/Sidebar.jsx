import { Link } from "react-router-dom";
import {
    FaHome,
    FaPlusCircle,
    FaSearchLocation,
    FaBuilding,
    FaClipboardCheck,
    FaFileAlt
} from "react-icons/fa";

function Sidebar() {

    return (

        <div className="w-64 bg-white shadow h-screen p-5">

            <h2 className="text-xl font-bold mb-8 text-green-700">
                Dashboard
            </h2>

            <div className="flex flex-col gap-5">

                <Link
                    to="/dashboard"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaHome />
                    Dashboard
                </Link>

                <Link
                    to="/properties"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaBuilding />
                    Properties
                </Link>

                <Link
                    to="/add-property"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaPlusCircle />
                    Add Property
                </Link>

                <Link
                    to="/address"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaSearchLocation />
                    Address Validation
                </Link>

                <div className="border-t border-slate-200 my-3"></div>

                <p className="text-xs text-slate-400 uppercase font-semibold px-1">
                    Analysis
                </p>

                <Link
                    to="/due-diligence"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaClipboardCheck />
                    Due Diligence
                </Link>

                <Link
                    to="/reports"
                    className="flex items-center gap-3 text-slate-700 hover:text-blue-600 transition"
                >
                    <FaFileAlt />
                    Reports
                </Link>

            </div>

        </div>

    );

}

export default Sidebar;