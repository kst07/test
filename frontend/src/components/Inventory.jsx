import React, { useEffect, useState } from 'react';
import AxiosInstance from './AxiosInstance';
import {
    Container, Typography, Paper, CircularProgress, Box, Divider,
    Grid, Card, CardContent, CardMedia, Chip, Button, Snackbar, Alert, TextField, Modal
} from '@mui/material';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ReceiptIcon from '@mui/icons-material/Receipt';

const categories = [
    { label: "ทั้งหมด", value: "all" },
    { label: "กาแฟ", value: "coffee" },
    { label: "ช็อคโกแลต", value: "chocolate" },
    { label: "โกโก้", value: "cocoa" },
    { label: "ชา", value: "tea" },
    { label: "นม", value: "milk" },
    { label: "ขนม", value: "bakery" }
];

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [addSnackbarOpen, setAddSnackbarOpen] = useState(false);
    const [removeSnackbarOpen, setRemoveSnackbarOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = () => {
        AxiosInstance.get('/products/')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
                setLoading(false);
            });
    };

    const addToCart = (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        setSnackbarMessage(`เพิ่ม ${product.name} ลงตะกร้าเรียบร้อย`);
        setSnackbarSeverity('success');
        setAddSnackbarOpen(true);
    };

    const removeFromCart = (productId) => {
        const removedProduct = cart.find(item => item.id === productId);
        setCart(cart.filter(item => item.id !== productId));
        setSnackbarMessage(`ลบ ${removedProduct.name} ออกจากตะกร้าเรียบร้อย`);
        setSnackbarSeverity('error');
        setRemoveSnackbarOpen(true);
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
        } else {
            setCart(cart.map(item =>
                item.id === productId ? { ...item, quantity: quantity } : item
            ));
        }
    };

    const handlePurchase = () => {
        const salesData = cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
        }));

        AxiosInstance.post('/bulk-sales/', { sales: salesData })
            .then(response => {
                setSnackbarMessage('ชำระเงินเรียบร้อยแล้ว');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setShowReceipt(true);
                setReceiptData({
                    items: cart,
                    total: cart.reduce((total, item) => total + item.price * item.quantity, 0),
                    date: new Date().toLocaleDateString(),
                    time: new Date().toLocaleTimeString(),
                });
                setCart([]);
                fetchProducts();
            })
            .catch(error => {
                console.error('There was an error recording the sale!', error);
                setSnackbarMessage('Failed to record sale. Please try again.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            });
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
        setAddSnackbarOpen(false);
        setRemoveSnackbarOpen(false);
    };

    const handleCategoryChange = (categoryValue) => {
        setSelectedCategory(categoryValue);
    };

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(product => product.category === selectedCategory);

    const handlePrintReceipt = () => {
        if (!receiptData) return;

        const content = `
           <html>
                    <head>
                        <title>ใบเสร็จ</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap');
                            body { 
                                font-family: 'Sarabun', sans-serif; 
                                padding: 20px;
                                max-width: 300px;
                                margin: 0 auto;
                            }
                            .header {
                                text-align: center;
                                border-bottom: 2px dashed #6d4c41;
                                padding-bottom: 15px;
                                margin-bottom: 20px;
                            }
                            .logo {
                                width: 80px;
                                margin-bottom: 10px;
                            }
                            .shop-name {
                                color: #6d4c41;
                                font-size: 24px;
                                font-weight: bold;
                                margin: 5px 0;
                            }
                            .shop-detail {
                                font-size: 12px;
                                color: #666;
                                margin: 3px 0;
                            }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 15px 0;
                            }
                            th {
                                background-color: #6d4c41;
                                color: white;
                                padding: 8px;
                                text-align: left;
                            }
                            td {
                                padding: 8px;
                                border-bottom: 1px solid #ddd;
                            }
                            .total-section {
                                background-color: #f5f5f5;
                                padding: 15px;
                                border-radius: 5px;
                                margin: 15px 0;
                            }
                            .thank-you {
                                text-align: center;
                                color: #6d4c41;
                                font-weight: bold;
                                margin-top: 20px;
                                border-top: 2px dashed #6d4c41;
                                padding-top: 15px;
                            }
                            .text-right {
                                text-align: right;
                            }
                            .item-name {
                                max-width: 150px;
                                word-wrap: break-word;
                            }
                            @media print {
                                body { 
                                    -webkit-print-color-adjust: exact; 
                                    print-color-adjust: exact;
                                }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <img src="https://cdn-icons-png.flaticon.com/512/924/924514.png" class="logo" alt="Café Logo">
                            <div class="shop-name">Coffee </div>
                            <div class="shop-detail">ที่อยู่: 123 ต.พังโคน อ.พังโคน สกลนคร</div>
                            <div class="shop-detail">โทร: 089-***-****</div>
                        </div>
                        
                        <table>
                            <tr>
                                <th>สินค้า</th>
                                <th>จำนวน</th>
                                <th class="text-right">ราคา</th>
                            </tr>
                            ${receiptData.items.map(item => `
                                <tr>
                                    <td class="item-name">${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td class="text-right">${(item.price * item.quantity).toLocaleString()} บาท</td>
                                </tr>
                            `).join('')}
                        </table>
        
                        <div class="total-section">
                            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                <div>รวมทั้งหมด:</div>
                                <div>${receiptData.total.toLocaleString()} บาท</div>
                            </div>
                            
                            
                        </div>
        
                        <div class="shop-detail" style="text-align: center;">
                            <div>วันที่ออกใบเสร็จ: ${receiptData.date}</div>
                            <div>เวลา: ${receiptData.time}</div>
                        </div>
        
                        <div class="thank-you">
                            ขอบคุณที่ใช้บริการครับ/ค่ะ
                            <div style="font-size: 12px; margin-top: 5px;">*สินค้าไม่สามารถคืนได้*</div>
                        </div>
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Box
            sx={{
                width: '100%',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                padding: '10px',
                maxWidth: '1200px',
                margin: '2px 240px 300px 260px',
                borderRadius: '10px',
            }}
        >
            <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
                <Typography
                    variant="h3"
                    align="center"
                    gutterBottom
                    sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        mb: 3,
                        mt: 2,
                        justifyContent: 'center',
                        color: "#4E342E",
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                        fontFamily: "Arial, sans-serif",
                    }}
                >
                    Café Inventory
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                    {categories.map(category => (
                        <Chip
                            key={category.value}
                            label={category.label}
                            onClick={() => handleCategoryChange(category.value)}
                            sx={{
                                backgroundColor: selectedCategory === category.value ? '#6d4c41' : '#8d6e63',
                                color: '#fff',
                                fontWeight: 'bold',
                                width: "9%",
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: '#5d4037',
                                },
                            }}
                        />
                    ))}
                </Box>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px" >
                        <CircularProgress sx={{ color: '#6d4c41' }} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 3 }}>
                        <Paper elevation={2} sx={{ padding: '20px', marginTop: '20px', backgroundColor: '#fff', borderRadius: '10px', flex: 3 }}>
                            <Grid container spacing={3}>
                                {filteredProducts.map(product => (
                                    <Grid item key={product.id} xs={12} sm={6} md={4}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                backgroundColor: '#f5f5f5',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                cursor: 'pointer',
                                                flexDirection: 'column',
                                                borderRadius: '10px',
                                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.02)',
                                                },
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={product.image || 'https://via.placeholder.com/150'}
                                                alt={product.name}
                                                sx={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                                            />
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography
                                                    variant="h6"
                                                    component="div"
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: '#4e342e',
                                                        fontFamily: 'cursive',
                                                    }}
                                                >
                                                    {product.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ marginTop: 1 }}
                                                >
                                                    {product.description || 'No description available.'}
                                                </Typography>
                                                <Box sx={{ marginTop: 2 }}>
                                                    <Chip
                                                        label={`Stock: ${product.stock}`}
                                                        sx={{
                                                            backgroundColor: '#6d4c41',
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                        }}
                                                    />
                                                    <Chip
                                                        label={`${product.price} บาท`}
                                                        sx={{
                                                            backgroundColor: '#8d6e63',
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                            marginLeft: 1,
                                                        }}
                                                    />
                                                </Box>
                                                <Box sx={{ marginTop: 3, textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                                                    <Button
                                                        variant="contained"
                                                        sx={{
                                                            backgroundColor: '#4caf50',
                                                            fontFamily: 'cursive',
                                                            fontSize: '15px',
                                                            borderRadius: '20px',
                                                            fontWeight: 'bold',
                                                            width: "100%",
                                                            color: '#fff',
                                                            '&:hover': {
                                                                backgroundColor: '#388e3c',
                                                            },
                                                        }}
                                                        onClick={() => addToCart(product)}
                                                    >
                                                        เพิ่มลงตะกร้า
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper elevation={2} sx={{ padding: '25px', marginTop: '20px', backgroundColor: '#fff5e6', borderRadius: '10px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <LocalCafeIcon sx={{ color: '#6d4c41', fontSize: '30px' }} />
                                    <Typography variant="h5" sx={{ color: '#6d4c41', fontWeight: 'bold' }}>ตะกร้าสินค้า</Typography>
                                </Box>
                                {cart.length === 0 ? (
                                    <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>ไม่มีสินค้าในตะกร้า</Typography>
                                ) : (
                                    <Box>
                                        {cart.map(item => (
                                            <Box key={item.id} sx={{ mb: 2, backgroundColor: '#fff', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4e342e' }}>{item.name}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TextField
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        sx={{ width: '60px' }}
                                                    />
                                                    <Typography variant="body2" sx={{ color: '#8d6e63' }}>{item.price * item.quantity} บาท</Typography>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ))}
                                        <Divider sx={{ my: 2, borderColor: '#6d4c41' }} />
                                        <Typography variant="h6" sx={{ mb: 2, color: '#6d4c41', fontWeight: 'bold' }}>
                                            รวม: {cart.reduce((total, item) => total + item.price * item.quantity, 0)} บาท
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                backgroundColor: '#6d4c41',
                                                fontFamily: 'cursive',
                                                fontSize: '15px',
                                                borderRadius: '20px',
                                                color: '#fff',
                                                '&:hover': {
                                                    backgroundColor: '#5d4037',
                                                },
                                            }}
                                            onClick={handlePurchase}
                                        >
                                            ชำระเงิน
                                        </Button>
                                    </Box>
                                )}
                            </Paper>

                            {showReceipt && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#6d4c41',
                                        fontFamily: 'cursive',
                                        fontSize: '15px',
                                        borderRadius: '20px',
                                        color: '#fff',
                                        '&:hover': {
                                            backgroundColor: '#5d4037',
                                        },
                                    }}
                                    onClick={() => setShowReceipt(true)}
                                >
                                    แสดงสลิป
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
            </Container>

            <Modal
                open={showReceipt}
                onClose={() => setShowReceipt(false)}
                aria-labelledby="receipt-modal"
                aria-describedby="receipt-modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: '10px',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <ReceiptIcon sx={{ color: '#6d4c41', fontSize: '30px' }} />
                        <Typography variant="h5" sx={{ color: '#6d4c41', fontWeight: 'bold' }}>สลิปการชำระเงิน</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#4e342e' }}>รายการสินค้า:</Typography>
                    {receiptData?.items.map(item => (
                        <Box key={item.id} sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#8d6e63' }}>
                                {item.name} x {item.quantity} = {item.price * item.quantity} บาท
                            </Typography>
                        </Box>
                    ))}
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#6d4c41' }}>
                        ยอดรวม: {receiptData?.total} บาท
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8d6e63', mt: 1 }}>
                        วันที่: {receiptData?.date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8d6e63', mt: 1 }}>
                        เวลา: {receiptData?.time}
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        sx={{
                            backgroundColor: '#6d4c41',
                            fontFamily: 'cursive',
                            fontSize: '15px',
                            borderRadius: '20px',
                            color: '#f0f0f0',
                            '&:hover': {
                                backgroundColor: '#5d4037',
                            },
                            mt: 2,
                        }}
                        onClick={handlePrintReceipt}
                    >
                        พิมพ์สลิป
                    </Button>
                </Box>
            </Modal>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '240px' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={addSnackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="success"
                    sx={{ width: '240px' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={removeSnackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity="error"
                    sx={{ width: '240px' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Inventory;