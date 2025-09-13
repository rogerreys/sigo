import {React,  FC, SVGProps} from 'react';
import { LuLogOut } from "react-icons/lu";
import { MdDashboard, MdPeople, MdInventory2, MdAssignment, MdSettings, MdOutlineDelete } from "react-icons/md";
import { ImSpinner } from "react-icons/im";
import { IoSearch, IoDocumentTextOutline } from "react-icons/io5";
import { FaHome, FaEdit, FaRegUser, FaChevronDown, FaRegUserCircle, FaPlus, FaArrowLeft, FaRegCheckCircle, FaRegClock, FaRegPauseCircle, FaRegFilePdf, FaBars, FaTimes, FaRegEnvelope, FaPhone, FaMapPin } from "react-icons/fa";
import { CgWorkAlt } from "react-icons/cg";
import { GrCircleInformation } from "react-icons/gr";
import { GoXCircle } from "react-icons/go";
import { CiFilter } from "react-icons/ci";
import { IoIosStats } from "react-icons/io";
import { MdWork } from "react-icons/md";

import { FaUsers, FaClipboardCheck, FaChartLine, FaFileInvoiceDollar, FaUser } from 'react-icons/fa';
import { MdOutlineSupportAgent, MdOutlineInventory } from 'react-icons/md';
import { GiAutoRepair } from 'react-icons/gi';
import { HiOutlineAdjustments } from "react-icons/hi"
import { CgRowLast } from "react-icons/cg";
import { HiBuildingOffice } from "react-icons/hi2";

type IconProps = {
    className?: string;
};

export const BuildingOfficeIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <HiBuildingOffice className={className} />
);
export const ExtraIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <CgRowLast  className={className} />
);
export const AdjustmentIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <HiOutlineAdjustments className={className} />
);

export const FaUsersIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaUsers className={className} />
);

export const ClipboardCheckIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaClipboardCheck className={className} />
);

export const ChartLineIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaChartLine className={className} />
);

export const FileInvoiceDollarIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaFileInvoiceDollar className={className} />
);

export const UserIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaUser className={className} />
);

export const SupportAgentIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdOutlineSupportAgent className={className} />
);

export const MdInventoryIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdOutlineInventory className={className} />
);

export const AutoRepairIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <GiAutoRepair className={className} />
);

export const StatsIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <IoIosStats className={className} />
);

export const FilterIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <CiFilter className={className} />
);

export const DocumentTextIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <IoDocumentTextOutline className={className} />
);

export const PauseCircleIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegPauseCircle className={className} />
);

export const ClockIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegClock className={className} />
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegCheckCircle className={className} />
);

export const XCircleIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <GoXCircle className={className} />
);

export const InformationCircleIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <GrCircleInformation className={className} />
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaArrowLeft className={className} />
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaChevronDown className={className} />
);

export const WorkOrderIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <CgWorkAlt className={className} />
);

export const UserCircleIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegUserCircle className={className} />
);

export const UsersIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegUser className={className} />
);

export const EditIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaEdit className={className} />
);

export const DeleteIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdOutlineDelete className={className} />
);
export const SearchIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <IoSearch className={className} />
);

export const LogoutIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <LuLogOut className={className} />
);

export const DashboardIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdDashboard className={className} />
);

export const CustomersIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdPeople className={className} />
);

export const InventoryIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdInventory2 className={className} />
);

export const MdAssignmentIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdAssignment className={className} />
);

export const SettingsIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdSettings className={className} />
);

export const LoadingSpinner: React.FC<IconProps> = ({ className }: IconProps) => (
    <ImSpinner className={className}/>
);

export const PlusIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaPlus className={className}/>
);

export const DocumentPDF: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegFilePdf className={className}/>
);

export const MdWorkOrderIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <MdWork className={className} />
);

export const HomeIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaHome className={className} />
);

export const MenuIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaBars className={className} />
);

export const CloseIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaTimes className={className} />
);

export const MailIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaRegEnvelope className={className} />
);

export const PhoneIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaPhone className={className} />
);

export const MapPinIcon: React.FC<IconProps> = ({ className }: IconProps) => (
    <FaMapPin className={className} />
);
