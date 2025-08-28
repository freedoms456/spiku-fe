import TableMasterPage from "@/components/table-master-page"
<<<<<<< HEAD

export default function TableMasterPageRoute() {
  return <TableMasterPage />
=======
import Navbar from "@/components/employee-management/navbar"

export default function TableMasterPageRoute() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSearchBar={false}/>
      <TableMasterPage/>
    </div>
  )
   

 
>>>>>>> 6c284cdf65c09949b970dcf3da232917ca0dc86b
}
