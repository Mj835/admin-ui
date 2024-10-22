import { useEffect, useState } from "react";
import {
  MdCancel,
  MdDeleteOutline,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdSave,
} from "react-icons/md";
import { FaEdit } from "react-icons/fa";

import "./App.css";

const itemsPerPage = 10;

function App() {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  const fetchTableData = async () => {
    const data = await fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    );
    const result = await data.json();
    setTableData(result);
  };

  useEffect(() => {
    fetchTableData();
  }, []);

  const handleSearch = () => {
    return tableData.filter(
      (item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.email.toLowerCase().includes(searchText.toLowerCase()) ||
        item.role.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const filteredData = handleSearch();
  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const onSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleSelectRow = (id) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((itemId) => itemId !== id)
        : [...selectedItems, id]
    );
  };

  const isAllSelected = getPaginatedData().length === selectedItems.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = getPaginatedData()?.map((item) => item.id);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    setTableData((prevData) =>
      prevData.filter((item) => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
  };

  const handleDeleteRow = (id) => {
    setTableData((prevData) => prevData.filter((item) => item.id !== id));
    setSelectedItems((prevData) => prevData.filter((item) => item.id !== id));
  };

  const handleEditClick = (data) => {
    setEditingId(data.id);
    setEditFormData({
      name: data.name,
      email: data.email,
      role: data.role,
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = (id) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, ...editFormData } : item
      )
    );
    setEditingId(null);
  };

  return (
    <div className="App">
      <input
        type="text"
        placeholder="Search by name, email or role"
        className="search-icon"
        value={searchText}
        onChange={(e) => onSearch(e)}
      />

      <table className="table-wrapper">
        <thead className="table-header">
          <tr>
            <td>
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e)}
              />
            </td>
            <td>Name</td>
            <td>Email</td>
            <td>Role</td>
            <td>Action</td>
          </tr>
        </thead>
        <tbody className="table-body">
          {getPaginatedData()?.map((data) => (
            <tr key={data.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(data.id)}
                  onClick={() => handleSelectRow(data.id)}
                />
              </td>
              <td>
                {editingId === data.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleFormChange}
                  />
                ) : (
                  data.name
                )}
              </td>
              <td>
                {editingId === data.id ? (
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleFormChange}
                  />
                ) : (
                  data.email
                )}
              </td>
              <td className="role">
                {editingId === data.id ? (
                  <input
                    type="text"
                    name="role"
                    value={editFormData.role}
                    onChange={handleFormChange}
                  />
                ) : (
                  data.role
                )}
              </td>
              <td className="action">
                {editingId === data.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(data.id)}
                      className="save"
                    >
                      <MdSave size={20} color="green" />
                    </button>
                    <button onClick={() => setEditingId(null)}>
                      <MdCancel size={20} color="red" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(data)}
                      className="edit"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteRow(data.id)}
                      className="delete"
                    >
                      <MdDeleteOutline size={20} color="red" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="bottom-wrapper">
        <button
          onClick={handleDeleteSelected}
          disabled={selectedItems.length === 0}
          className="multiple-delete"
        >
          Delete Selected
        </button>
        <div className="pagination-wrapper">
          <button disabled={currentPage === 1} className="first-page">
            <MdKeyboardDoubleArrowLeft
              size={25}
              color="white"
              onClick={() => goToPage(1)}
            />
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="previous-page"
          >
            <MdKeyboardArrowLeft size={25} color="white" />
          </button>
          {[...Array(totalPages).keys()]?.map((e) => (
            <button
              key={e + 1}
              className={`page-number ${currentPage === e + 1 ? "active" : ""}`}
              onClick={() => goToPage(e + 1)}
            >
              {e + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="next-page"
          >
            <MdKeyboardArrowRight size={25} color="white" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => goToPage(totalPages)}
            className="last-page"
          >
            <MdKeyboardDoubleArrowRight size={25} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
