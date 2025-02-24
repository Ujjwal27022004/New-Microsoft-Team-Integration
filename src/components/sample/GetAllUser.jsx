import React, { useEffect, useState } from "react";
import { DetailsList, DetailsListLayoutMode, SelectionMode, PrimaryButton, Text } from "@fluentui/react";

const GetAllUser = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetch("http://localhost:5000/get-jira-issues")
            .then((response) => response.json())
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    const columns = [
        // { key: "id", name: "ID", fieldName: "id", minWidth: 50, maxWidth: 100, isResizable: true },
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
            {/* <Text variant="xxLarge" styles={{ root: { fontWeight: "bold", marginBottom: "10px", display: "block" } }}>Get All Users</Text> */}
            <DetailsList
                items={paginatedItems}
                columns={columns}
                setKey="set"
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
                styles={{ root: { background: "#fff", padding: "10px", borderRadius: "8px" } }}
            />
            <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                <PrimaryButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                    Previous
                </PrimaryButton>
                <Text variant="large">Page {currentPage} of {totalPages}</Text>
                <PrimaryButton onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                </PrimaryButton>
            </div>
        </div>
    );
};

export default GetAllUser;
