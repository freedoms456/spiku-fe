import TableMasterPage from "@/components/table-master-page"
import Navbar from "@/components/employee-management/navbar"

export default function TableMasterPageRoute() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearchBar={false}/>
      <TableMasterPage/>
    </div>
  )
   

 
}
