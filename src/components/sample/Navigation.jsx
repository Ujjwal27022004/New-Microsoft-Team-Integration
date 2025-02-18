import React from "react";
import { MenuList, MenuItem } from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { 
    Home24Filled, 
    Money24Filled, 
    Savings24Filled, 
    ShieldLock24Filled 
} from "@fluentui/react-icons"; 

const Navigation = () => {
    const navigate = useNavigate();

    const links = [
        { name: "Dashboard", key: "tab", url: "/tab", icon: <Home24Filled /> },
        { name: "Transfer", key: "message-extension", url: "/message-extension", icon: <Money24Filled /> },
        { name: "Transaction", key: "bot", url: "/bot", icon: <Money24Filled /> },
        { name: "Accounts and Cards", key: "meeting-extension", url: "/meeting-extension", icon: <Savings24Filled /> },
        { name: "Investment", key: "privacy", url: "/privacy", icon: <Savings24Filled /> },
        // { name: "Terms of Use", key: "terms-of-use", url: "/termsofuse", icon: <ShieldLock24Filled /> },
    ];

    return (
        <div style={{
            width: "250px",
            height: "100vh",
            background: "#D3D3D3",
            padding: "20px",
            position: "fixed",
            left: 0,
            top: 0,
            display: "flex",
            flexDirection: "column",
            gap: "10px"
        }}>
            <MenuList>
                <h2>Menu</h2>
                {links.map(link => (
                    <MenuItem 
                        key={link.key} 
                        onClick={() => navigate(link.url)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px",
                            borderRadius: "5px",
                            fontSize: "16px",
                            fontWeight: "400",
                            color: "black",
                            cursor: "pointer",
                            transition: "background 0.3s",
                            background: "#D3D3D3"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#C0C0C0"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#D3D3D3"}
                    >
                        <span style={{ fontSize: "15px", alignItems: "center" }}>{link.icon}</span> 
                        {link.name}
                    </MenuItem>
                ))}
            </MenuList>
        </div>
    );
};

export default Navigation;
