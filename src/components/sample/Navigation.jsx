import React from "react";
import { Button, MenuList, MenuItem } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
    const navigate = useNavigate();

    const links = [
        { name: "Main Tab", key: "tab", url: "/tab" },
        { name: "Message Extension", key: "message-extension", url: "/message-extension" },
        { name: "Bot", key: "bot", url: "/bot" },
        { name: "Meeting Extension", key: "meeting-extension", url: "/meeting-extension" },
        { name: "Privacy", key: "privacy", url: "/privacy" },
        { name: "Terms of Use", key: "terms-of-use", url: "/termsofuse" },
    ];

    return (
        <div style={{
            width: "200px",
            height: "100vh",
            background: "#f3f2f1",
            padding: "10px",
            position: "fixed",
            left: 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        }}>
            <MenuList>
                {links.map(link => (
                    <MenuItem key={link.key} onClick={() => navigate(link.url)}>
                        {link.name}
                    </MenuItem>
                ))}
            </MenuList>
        </div>
    );
};

export default Navigation;
