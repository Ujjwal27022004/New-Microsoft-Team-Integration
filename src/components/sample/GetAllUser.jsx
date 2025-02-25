import React, { useEffect, useState } from "react";
import { DetailsList, DetailsListLayoutMode, SelectionMode, PrimaryButton, Text, TextField } from "@fluentui/react";

const GetAllUser = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 10;

    // Fetch all issues initially
    useEffect(() => {
        fetchAllIssues();
    }, []);

    const fetchAllIssues = () => {
        fetch("http://localhost:5000/get-jira-issues")
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error));
    };

    // Handle search functionality
    const handleSearch = () => {
        if (!searchKey.trim()) {
            fetchAllIssues(); // Reset to all issues if search is empty
            return;
        }

        setLoading(true);
        fetch(`http://localhost:5000/search-jira-issue?key=${searchKey}`)
            .then((response) => response.json())
            .then((data) => {
                setData(data ? [data] : []); // Set the found issue or empty array
                setCurrentPage(1); // Reset pagination
            })
            .catch((error) => console.error("Error searching issue:", error))
            .finally(() => setLoading(false));
    };

    const columns = [
        { key: "key", name: "Key", fieldName: "key", minWidth: 100, maxWidth: 150, isResizable: true },
        { key: "summary", name: "Summary", fieldName: "summary", minWidth: 150, maxWidth: 300, isResizable: true },
        { key: "description", name: "Description", fieldName: "description", minWidth: 150, maxWidth: 300, isResizable: true },
        { key: "issueType", name: "Issue Type", fieldName: "issueType", minWidth: 100, maxWidth: 100, isResizable: true },
        { key: "status", name: "Status", fieldName: "status", minWidth: 100, maxWidth: 150, isResizable: true },
        { key: "priority", name: "Priority", fieldName: "priority", minWidth: 100, maxWidth: 100, isResizable: true },
        { key: "assignee", name: "Assignee", fieldName: "assignee", minWidth: 150, maxWidth: 200, isResizable: true },
        { key: "reporter", name: "Reporter", fieldName: "reporter", minWidth: 150, maxWidth: 200, isResizable: true },
        { key: "createdAt", name: "Created At", fieldName: "createdAt", minWidth: 150, maxWidth: 200, isResizable: true },
        { key: "updatedAt", name: "Updated At", fieldName: "updatedAt", minWidth: 150, maxWidth: 200, isResizable: true },
    ];

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedItems = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div style={{ padding: "20px", backgroundColor: "#f3f3f3", borderRadius: "8px" }}>
            {/* Search Bar */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <TextField
                    placeholder="Search by Issue Key..."
                    value={searchKey}
                    onChange={(e, newValue) => setSearchKey(newValue)}
                    styles={{ root: { flex: 1 } }}
                />
                <PrimaryButton onClick={handleSearch} disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                </PrimaryButton>
            </div>

            {/* Issue List */}
            <DetailsList
                items={paginatedItems}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                styles={{ root: { background: "#fff", padding: "10px", borderRadius: "8px" } }}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <PrimaryButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        Previous
                    </PrimaryButton>
                    <Text variant="large">Page {currentPage} of {totalPages}</Text>
                    <PrimaryButton onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </PrimaryButton>
                </div>
            )}
        </div>
    );
};

export default GetAllUser;
