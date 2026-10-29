/* =========================================
   1. إعدادات النظام والتخزين
========================================= */

const STORAGE_KEY = "makhzani_products_v1";

let products = loadProducts();

let productToDelete = null;


/* =========================================
   2. الوصول إلى عناصر الصفحة
========================================= */

const elements = {

    todayDate: document.getElementById("todayDate"),

    totalProducts: document.getElementById("totalProducts"),

    totalQuantity: document.getElementById("totalQuantity"),

    totalCost: document.getElementById("totalCost"),

    totalSales: document.getElementById("totalSales"),

    totalProfit: document.getElementById("totalProfit"),

    inventoryValue: document.getElementById("inventoryValue"),

    lowStockCount: document.getElementById("lowStockCount"),

    reportProducts: document.getElementById("reportProducts"),

    reportQuantity: document.getElementById("reportQuantity"),

    reportCost: document.getElementById("reportCost"),

    reportSales: document.getElementById("reportSales"),

    reportProfit: document.getElementById("reportProfit"),

    reportLowStock: document.getElementById("reportLowStock"),

    productsTableBody: document.getElementById("productsTableBody"),

    tableProductCount: document.getElementById("tableProductCount"),

    emptyState: document.getElementById("emptyState"),

    searchInput: document.getElementById("searchInput"),

    categoryFilter: document.getElementById("categoryFilter"),

    unitFilter: document.getElementById("unitFilter"),

    resetFiltersBtn: document.getElementById("resetFiltersBtn"),

    productModal: document.getElementById("productModal"),

    deleteModal: document.getElementById("deleteModal"),

    productForm: document.getElementById("productForm"),

    productId: document.getElementById("productId"),

    productName: document.getElementById("productName"),

    productCategory: document.getElementById("productCategory"),

    productUnit: document.getElementById("productUnit"),

    stockUnit: document.getElementById("stockUnit"),

    unitsPerPackage: document.getElementById("unitsPerPackage"),

    stockQuantity: document.getElementById("stockQuantity"),

    purchasePrice: document.getElementById("purchasePrice"),

    sellingPrice: document.getElementById("sellingPrice"),

    minimumStock: document.getElementById("minimumStock"),

    unitsPerPackageGroup: document.getElementById("unitsPerPackageGroup"),

    stockQuantityLabel: document.getElementById("stockQuantityLabel"),

    purchasePriceLabel: document.getElementById("purchasePriceLabel"),

    sellingPriceLabel: document.getElementById("sellingPriceLabel"),

    previewUnits: document.getElementById("previewUnits"),

    previewCost: document.getElementById("previewCost"),

    previewSales: document.getElementById("previewSales"),

    previewProfit: document.getElementById("previewProfit"),

    modalTitle: document.getElementById("modalTitle"),

    saveProductBtn: document.getElementById("saveProductBtn"),

    deleteMessage: document.getElementById("deleteMessage"),

    toastContainer: document.getElementById("toastContainer"),

    restoreInput: document.getElementById("restoreInput"),

    sidebar: document.getElementById("sidebar"),

    menuToggle: document.getElementById("menuToggle")

};


/* =========================================
   3. أدوات مساعدة
========================================= */

// تحويل القيمة إلى رقم آمن.
function toNumber(value) {

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;

}


// تنسيق الأرقام مع مراعاة الكسور.
function formatNumber(value) {

    return new Intl.NumberFormat("ar-EG", {

        maximumFractionDigits: 3

    }).format(toNumber(value));

}


// تنسيق الأموال بالجنيه المصري.
function formatMoney(value) {

    return new Intl.NumberFormat("ar-EG", {

        style: "currency",

        currency: "EGP",

        minimumFractionDigits: 2,

        maximumFractionDigits: 2

    }).format(toNumber(value));

}


// إنشاء معرف فريد للمنتج.
function createId() {

    if (window.crypto && typeof window.crypto.randomUUID === "function") {

        return window.crypto.randomUUID();

    }

    return Date.now().toString(36) + Math.random().toString(36).slice(2);

}


// حماية النصوص عند عرضها داخل HTML.
function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

        const entities = {

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#39;"

        };

        return entities[character];

    });

}


// تاريخ اليوم.
function updateDate() {

    elements.todayDate.textContent = new Intl.DateTimeFormat("ar-EG", {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    }).format(new Date());

}


/* =========================================
   4. تحميل البيانات وحفظها
========================================= */

// قراءة البيانات المحفوظة على الجهاز.
function loadProducts() {

    try {

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {

            return [];

        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {

            return [];

        }

        return parsedData.filter(function (product) {

            return product && typeof product === "object";

        });

    } catch (error) {

        console.error("تعذر تحميل بيانات المخزون:", error);

        return [];

    }

}


// حفظ البيانات محليًا.
function saveProducts() {

    try {

        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

        return true;

    } catch (error) {

        console.error("تعذر حفظ بيانات المخزون:", error);

        showToast(

            "تعذر حفظ البيانات. قد تكون مساحة التخزين ممتلئة.",

            "error"

        );

        return false;

    }

}


/* =========================================
   5. حسابات المنتج
========================================= */

// تحديد عدد وحدات البيع الموجودة في وحدة التخزين.
function getUnitsPerPackage(product) {

    return Math.max(1, toNumber(product.unitsPerPackage) || 1);

}


// إجمالي وحدات البيع الأساسية في المخزون.
function calculateUnits(product) {

    return toNumber(product.stockQuantity) *

        getUnitsPerPackage(product);

}


// إجمالي تكلفة المخزون.
function calculateCost(product) {

    return toNumber(product.stockQuantity) *

        toNumber(product.purchasePrice);

}


// إجمالي قيمة البيع المتوقعة.
function calculateSales(product) {

    return calculateUnits(product) *

        toNumber(product.sellingPrice);

}


// المكسب المتوقع من كامل المخزون.
function calculateProfit(product) {

    return calculateSales(product) -

        calculateCost(product);

}


// تكلفة وحدة البيع الأساسية.
function calculateUnitCost(product) {

    return toNumber(product.purchasePrice) /

        getUnitsPerPackage(product);

}


// المكسب المتوقع من وحدة التخزين الواحدة.
function calculatePackageProfit(product) {

    const packageSales = getUnitsPerPackage(product) *

        toNumber(product.sellingPrice);

    return packageSales - toNumber(product.purchasePrice);

}


// تحديد حالة المخزون.
function getStockStatus(product) {

    const quantity = toNumber(product.stockQuantity);

    const minimum = toNumber(product.minimumStock);

    if (quantity <= 0) {

        return {

            className: "empty",

            label: "نفد المخزون"

        };

    }

    if (quantity <= minimum) {

        return {

            className: "low",

            label: "مخزون منخفض"

        };

    }

    return {

        className: "normal",

        label: "متوفر"

    };

}


/* =========================================
   6. ملخص المخزون
========================================= */

// حساب الملخص المالي لجميع المنتجات.
function calculateSummary() {

    return products.reduce(function (summary, product) {

        summary.products += 1;

        summary.quantity += calculateUnits(product);

        summary.cost += calculateCost(product);

        summary.sales += calculateSales(product);

        summary.profit += calculateProfit(product);

        if (

            toNumber(product.stockQuantity) <=

            toNumber(product.minimumStock)

        ) {

            summary.lowStock += 1;

        }

        return summary;

    }, {

        products: 0,

        quantity: 0,

        cost: 0,

        sales: 0,

        profit: 0,

        lowStock: 0

    });

}


// تحديث بطاقات لوحة التحكم والتقرير.
function renderSummary() {

    const summary = calculateSummary();

    elements.totalProducts.textContent =

        formatNumber(summary.products);

    elements.totalQuantity.textContent =

        formatNumber(summary.quantity);

    elements.totalCost.textContent =

        formatMoney(summary.cost);

    elements.totalSales.textContent =

        formatMoney(summary.sales);

    elements.totalProfit.textContent =

        formatMoney(summary.profit);

    elements.inventoryValue.textContent =

        formatMoney(summary.cost);

    elements.lowStockCount.textContent =

        formatNumber(summary.lowStock);


    elements.reportProducts.textContent =

        formatNumber(summary.products);

    elements.reportQuantity.textContent =

        formatNumber(summary.quantity);

    elements.reportCost.textContent =

        formatMoney(summary.cost);

    elements.reportSales.textContent =

        formatMoney(summary.sales);

    elements.reportProfit.textContent =

        formatMoney(summary.profit);

    elements.reportLowStock.textContent =

        formatNumber(summary.lowStock);

}


/* =========================================
   7. تحديث خيارات الأقسام
========================================= */

function renderCategoryFilter() {

    const selectedCategory = elements.categoryFilter.value;

    const categories = [...new Set(

        products

            .map(function (product) {

                return String(product.category || "").trim();

            })

            .filter(Boolean)

    )].sort(function (a, b) {

        return a.localeCompare(b, "ar");

    });


    elements.categoryFilter.innerHTML =

        '<option value="">كل الأقسام</option>';


    categories.forEach(function (category) {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        elements.categoryFilter.appendChild(option);

    });


    if (categories.includes(selectedCategory)) {

        elements.categoryFilter.value = selectedCategory;

    }

}


/* =========================================
   8. البحث وتصفية المنتجات
========================================= */

function getFilteredProducts() {

    const searchTerm = elements.searchInput.value

        .trim()

        .toLocaleLowerCase("ar");


    const selectedCategory = elements.categoryFilter.value;

    const selectedUnit = elements.unitFilter.value;


    return products.filter(function (product) {

        const name = String(product.name || "")

            .toLocaleLowerCase("ar");

        const category = String(product.category || "")

            .toLocaleLowerCase("ar");


        const matchesSearch =

            name.includes(searchTerm) ||

            category.includes(searchTerm);


        const matchesCategory =

            !selectedCategory ||

            product.category === selectedCategory;


        const matchesUnit =

            !selectedUnit ||

            product.unit === selectedUnit;


        return matchesSearch &&

            matchesCategory &&

            matchesUnit;

    });

}


/* =========================================
   9. عرض المنتجات داخل الجدول
========================================= */

function renderProducts() {

    const filteredProducts = getFilteredProducts();

    elements.productsTableBody.innerHTML = "";

    elements.tableProductCount.textContent =

        formatNumber(filteredProducts.length) + " منتج";


    elements.emptyState.classList.toggle(

        "show",

        filteredProducts.length === 0

    );


    filteredProducts.forEach(function (product) {

        const row = document.createElement("tr");

        const status = getStockStatus(product);

        const units = calculateUnits(product);

        const cost = calculateCost(product);

        const sales = calculateSales(product);

        const profit = calculateProfit(product);


        const profitClass = profit >= 0

            ? "profit-cell"

            : "loss-cell";


        row.innerHTML = `

            <td>

                <div class="product-cell">

                    <div class="product-avatar">

                        ${escapeHTML(

                            String(product.name || "?").trim().charAt(0)

                        )}

                    </div>

                    <div>

                        <div class="product-name">

                            ${escapeHTML(product.name)}

                        </div>

                        <div class="product-subtitle">

                            ${formatNumber(units)} ${escapeHTML(product.unit)}

                        </div>

                    </div>

                </div>

            </td>


            <td>

                ${escapeHTML(product.category)}

            </td>


            <td>

                <div class="table-number">

                    ${formatNumber(product.stockQuantity)}

                    ${escapeHTML(product.stockUnit)}

                </div>

                <div class="product-subtitle">

                    ${formatNumber(units)} ${escapeHTML(product.unit)}

                </div>

            </td>


            <td>

                <div class="table-number">

                    ${formatMoney(cost)}

                </div>

                <div class="product-subtitle">

                    ${formatMoney(product.purchasePrice)} / ${escapeHTML(product.stockUnit)}

                </div>

            </td>


            <td>

                <div class="table-number">

                    ${formatMoney(sales)}

                </div>

                <div class="product-subtitle">

                    ${formatMoney(product.sellingPrice)} / ${escapeHTML(product.unit)}

                </div>

            </td>


            <td>

                <span class="${profitClass}">

                    ${formatMoney(profit)}

                </span>

                <div class="product-subtitle">

                    ${formatMoney(calculatePackageProfit(product))} / ${escapeHTML(product.stockUnit)}

                </div>

            </td>


            <td>

                <span class="stock-badge ${status.className}">

                    ${escapeHTML(status.label)}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button

                        class="action-button"

                        data-action="edit"

                        data-id="${escapeHTML(product.id)}"

                        aria-label="تعديل المنتج"

                        title="تعديل المنتج"

                    >

                        ✎

                    </button>


                    <button

                        class="action-button delete"

                        data-action="delete"

                        data-id="${escapeHTML(product.id)}"

                        aria-label="حذف المنتج"

                        title="حذف المنتج"

                    >

                        ×

                    </button>

                </div>

            </td>

        `;


        elements.productsTableBody.appendChild(row);

    });

}


/* =========================================
   10. تحديث الواجهة كاملة
========================================= */

function renderAll() {

    renderSummary();

    renderCategoryFilter();

    renderProducts();

}


/* =========================================
   11. التحكم في وحدات التخزين والبيع
========================================= */

// عند اختيار نفس وحدة التخزين والبيع،
// يتم ضبط معامل التحويل إلى 1 تلقائيًا.
function updateUnitSettings() {

    const stockUnit = elements.stockUnit.value;

    const sellingUnit = elements.productUnit.value;

    const sameUnit = stockUnit === sellingUnit;


    elements.unitsPerPackageGroup.style.display =

        sameUnit ? "none" : "flex";


    if (sameUnit) {

        elements.unitsPerPackage.value = "1";

        elements.unitsPerPackage.readOnly = true;

    } else {

        elements.unitsPerPackage.readOnly = false;

        if (toNumber(elements.unitsPerPackage.value) < 1) {

            elements.unitsPerPackage.value = "1";

        }

    }


    elements.stockQuantityLabel.textContent =

        "كمية المخزون (" + stockUnit + ") *";


    elements.purchasePriceLabel.textContent =

        "سعر شراء " + stockUnit + " (جنيه) *";


    elements.sellingPriceLabel.textContent =

        "سعر بيع " + sellingUnit + " (جنيه) *";


    updatePreview();

}


/* =========================================
   12. معاينة الحسابات قبل الحفظ
========================================= */

function updatePreview() {

    const stockUnit = elements.stockUnit.value;

    const sellingUnit = elements.productUnit.value;


    let unitsPerPackage = toNumber(

        elements.unitsPerPackage.value

    );


    if (stockUnit === sellingUnit) {

        unitsPerPackage = 1;

    }


    const stockQuantity = toNumber(

        elements.stockQuantity.value

    );


    const purchasePrice = toNumber(

        elements.purchasePrice.value

    );


    const sellingPrice = toNumber(

        elements.sellingPrice.value

    );


    const totalUnits = stockQuantity * unitsPerPackage;

    const totalCost = stockQuantity * purchasePrice;

    const totalSales = totalUnits * sellingPrice;

    const totalProfit = totalSales - totalCost;


    elements.previewUnits.textContent =

        formatNumber(totalUnits) + " " + sellingUnit;


    elements.previewCost.textContent =

        formatMoney(totalCost);


    elements.previewSales.textContent =

        formatMoney(totalSales);


    elements.previewProfit.textContent =

        formatMoney(totalProfit);


    elements.previewProfit.style.color =

        totalProfit >= 0 ? "var(--green)" : "var(--red)";

}


/* =========================================
   13. فتح نافذة إضافة المنتج
========================================= */

function openAddModal() {

    elements.productForm.reset();

    elements.productId.value = "";

    elements.productUnit.value = "كيس";

    elements.stockUnit.value = "كرتونة";

    elements.unitsPerPackage.value = "12";

    elements.minimumStock.value = "5";

    elements.modalTitle.textContent = "إضافة منتج جديد";

    elements.saveProductBtn.textContent = "حفظ المنتج";


    updateUnitSettings();

    updatePreview();


    elements.productModal.classList.add("show");

    elements.productModal.setAttribute("aria-hidden", "false");


    document.body.style.overflow = "hidden";


    setTimeout(function () {

        elements.productName.focus();

    }, 100);

}


/* =========================================
   14. إغلاق نافذة المنتج
========================================= */

function closeProductModal() {

    elements.productModal.classList.remove("show");

    elements.productModal.setAttribute("aria-hidden", "true");


    document.body.style.overflow = "";

}


/* =========================================
   15. تعديل منتج موجود
========================================= */

function openEditModal(productId) {

    const product = products.find(function (item) {

        return item.id === productId;

    });


    if (!product) {

        showToast("المنتج غير موجود.", "error");

        return;

    }


    elements.productForm.reset();


    elements.productId.value = product.id;

    elements.productName.value = product.name;

    elements.productCategory.value = product.category;

    elements.productUnit.value = product.unit;

    elements.stockUnit.value = product.stockUnit;

    elements.unitsPerPackage.value = product.unitsPerPackage;

    elements.stockQuantity.value = product.stockQuantity;

    elements.purchasePrice.value = product.purchasePrice;

    elements.sellingPrice.value = product.sellingPrice;

    elements.minimumStock.value = product.minimumStock;


    elements.modalTitle.textContent = "تعديل بيانات المنتج";

    elements.saveProductBtn.textContent = "حفظ التعديلات";


    updateUnitSettings();

    updatePreview();


    elements.productModal.classList.add("show");

    elements.productModal.setAttribute("aria-hidden", "false");


    document.body.style.overflow = "hidden";

}


/* =========================================
   16. التحقق من بيانات المنتج
========================================= */

function validateProduct(data) {

    if (!data.name.trim()) {

        showToast("اكتب اسم المنتج أولًا.", "error");

        elements.productName.focus();

        return false;

    }


    if (!data.category.trim()) {

        showToast("اكتب القسم التابع له المنتج.", "error");

        elements.productCategory.focus();

        return false;

    }


    const numericFields = [

        {

            name: "كمية المخزون",

            value: data.stockQuantity

        },

        {

            name: "سعر الشراء",

            value: data.purchasePrice

        },

        {

            name: "سعر البيع",

            value: data.sellingPrice

        },

        {

            name: "الحد الأدنى",

            value: data.minimumStock

        },

        {

            name: "عدد الوحدات داخل العبوة",

            value: data.unitsPerPackage

        }

    ];


    for (const field of numericFields) {

        if (!Number.isFinite(field.value) || field.value < 0) {

            showToast(

                "تحقق من قيمة " + field.name + ".",

                "error"

            );

            return false;

        }

    }


    if (data.unitsPerPackage < 1) {

        showToast(

            "عدد الوحدات داخل وحدة التخزين يجب أن يكون 1 على الأقل.",

            "error"

        );

        return false;

    }


    if (

        data.stockUnit === data.unit &&

        data.unitsPerPackage !== 1

    ) {

        showToast(

            "عندما تتطابق وحدتا التخزين والبيع، يجب أن يكون معامل التحويل 1.",

            "error"

        );

        return false;

    }


    return true;

}


/* =========================================
   17. إضافة المنتج أو حفظ تعديلاته
========================================= */

function handleProductSubmit(event) {

    event.preventDefault();


    const stockUnit = elements.stockUnit.value;

    const sellingUnit = elements.productUnit.value;


    const unitsPerPackage = stockUnit === sellingUnit

        ? 1

        : toNumber(elements.unitsPerPackage.value);


    const productData = {

        id: elements.productId.value || createId(),

        name: elements.productName.value.trim(),

        category: elements.productCategory.value.trim(),

        unit: sellingUnit,

        stockUnit: stockUnit,

        unitsPerPackage: unitsPerPackage,

        stockQuantity: toNumber(elements.stockQuantity.value),

        purchasePrice: toNumber(elements.purchasePrice.value),

        sellingPrice: toNumber(elements.sellingPrice.value),

        minimumStock: toNumber(elements.minimumStock.value)

    };


    if (!validateProduct(productData)) {

        return;

    }


    const existingIndex = products.findIndex(function (product) {

        return product.id === productData.id;

    });


    if (existingIndex !== -1) {

        products[existingIndex] = productData;

    } else {

        products.push(productData);

    }


    if (!saveProducts()) {

        // إعادة تحميل آخر نسخة محفوظة إذا فشل الحفظ.
        products = loadProducts();

        renderAll();

        return;

    }


    closeProductModal();

    renderAll();


    showToast(

        existingIndex !== -1

            ? "تم تحديث بيانات المنتج بنجاح."

            : "تمت إضافة المنتج بنجاح.",

        "success"

    );

}


/* =========================================
   18. فتح نافذة تأكيد الحذف
========================================= */

function openDeleteModal(productId) {

    const product = products.find(function (item) {

        return item.id === productId;

    });


    if (!product) {

        showToast("المنتج غير موجود.", "error");

        return;

    }


    productToDelete = productId;


    elements.deleteMessage.textContent =

        'هل تريد حذف المنتج "' + product.name + '"؟';


    elements.deleteModal.classList.add("show");

    elements.deleteModal.setAttribute("aria-hidden", "false");


    document.body.style.overflow = "hidden";

}


/* =========================================
   19. إلغاء الحذف
========================================= */

function closeDeleteModal() {

    elements.deleteModal.classList.remove("show");

    elements.deleteModal.setAttribute("aria-hidden", "true");


    productToDelete = null;


    if (!elements.productModal.classList.contains("show")) {

        document.body.style.overflow = "";

    }

}


/* =========================================
   20. تنفيذ الحذف
========================================= */

function confirmDelete() {

    if (!productToDelete) {

        return;

    }


    const previousProducts = [...products];


    products = products.filter(function (product) {

        return product.id !== productToDelete;

    });


    if (!saveProducts()) {

        products = previousProducts;

        return;

    }


    closeDeleteModal();

    renderAll();


    showToast("تم حذف المنتج بنجاح.", "success");

}


/* =========================================
   21. رسائل التنبيه
========================================= */

function showToast(message, type = "success") {

    const toast = document.createElement("div");

    toast.className = "toast " + type;

    toast.textContent = message;


    elements.toastContainer.appendChild(toast);


    setTimeout(function () {

        toast.remove();

    }, 3500);

}


/* =========================================
   22. تصدير المنتجات إلى CSV
========================================= */

function exportCSV() {

    if (products.length === 0) {

        showToast("لا توجد منتجات لتصديرها.", "warning");

        return;

    }


    const headers = [

        "اسم المنتج",

        "القسم",

        "وحدة التخزين",

        "وحدة البيع",

        "عدد وحدات البيع داخل وحدة التخزين",

        "كمية المخزون",

        "إجمالي وحدات البيع",

        "سعر شراء وحدة التخزين",

        "تكلفة المخزون",

        "سعر بيع الوحدة الأساسية",

        "قيمة البيع المتوقعة",

        "المكسب المتوقع",

        "المكسب من وحدة التخزين",

        "الحد الأدنى للمخزون",

        "حالة المخزون"

    ];


    const rows = products.map(function (product) {

        return [

            product.name,

            product.category,

            product.stockUnit,

            product.unit,

            product.unitsPerPackage,

            product.stockQuantity,

            calculateUnits(product),

            product.purchasePrice,

            calculateCost(product),

            product.sellingPrice,

            calculateSales(product),

            calculateProfit(product),

            calculatePackageProfit(product),

            product.minimumStock,

            getStockStatus(product).label

        ];

    });


    function escapeCSV(value) {

        let text = String(value ?? "");


        // حماية البيانات النصية من تفسيرها كمعادلات في برامج الجداول.
        if (/^[\s]*[=+\-@]/.test(text)) {

            text = "'" + text;

        }


        return '"' + text.replace(/"/g, '""') + '"';

    }


    const csvContent =

        "\uFEFF" +

        [headers, ...rows]

            .map(function (row) {

                return row.map(escapeCSV).join(",");

            })

            .join("\r\n");


    downloadFile(

        csvContent,

        "makhzani-products.csv",

        "text/csv;charset=utf-8;"

    );


    showToast("تم تجهيز ملف CSV بنجاح.", "success");

}


/* =========================================
   23. النسخ الاحتياطي بصيغة JSON
========================================= */

function exportBackup() {

    const backupData = {

        application: "Makhzani",

        version: 1,

        exportedAt: new Date().toISOString(),

        products: products

    };


    const content = JSON.stringify(backupData, null, 2);


    downloadFile(

        content,

        "makhzani-backup.json",

        "application/json;charset=utf-8;"

    );


    showToast("تم تنزيل النسخة الاحتياطية.", "success");

}


/* =========================================
   24. تنزيل الملفات
========================================= */

function downloadFile(content, filename, mimeType) {

    const blob = new Blob(

        [content],

        { type: mimeType }

    );


    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");


    link.href = url;

    link.download = filename;


    document.body.appendChild(link);

    link.click();

    link.remove();


    setTimeout(function () {

        URL.revokeObjectURL(url);

    }, 1000);

}


/* =========================================
   25. التحقق من النسخة الاحتياطية
========================================= */

function validateBackupProducts(data) {

    if (!Array.isArray(data)) {

        throw new Error("ملف النسخة الاحتياطية غير صالح.");

    }


    if (data.length > 10000) {

        throw new Error("عدد المنتجات في الملف أكبر من الحد المسموح.");

    }


    const ids = new Set();


    return data.map(function (product) {

        if (!product || typeof product !== "object") {

            throw new Error("توجد بيانات منتج غير صالحة.");

        }


        const name = String(product.name || "").trim();

        const category = String(product.category || "").trim();

        const stockUnit = String(product.stockUnit || "").trim();

        const unit = String(product.unit || "").trim();


        if (!name || !category || !stockUnit || !unit) {

            throw new Error("توجد منتجات ينقصها الاسم أو القسم أو الوحدة.");

        }


        if (name.length > 100 || category.length > 60) {

            throw new Error("يوجد اسم منتج أو قسم أطول من الحد المسموح.");

        }


        const stockQuantity = Number(product.stockQuantity);

        const purchasePrice = Number(product.purchasePrice);

        const sellingPrice = Number(product.sellingPrice);

        const minimumStock = Number(product.minimumStock);

        const unitsPerPackage = Number(product.unitsPerPackage);


        const numbers = [

            stockQuantity,

            purchasePrice,

            sellingPrice,

            minimumStock,

            unitsPerPackage

        ];


        if (

            numbers.some(function (number) {

                return !Number.isFinite(number) || number < 0;

            })

        ) {

            throw new Error("توجد كميات أو أسعار غير صالحة.");

        }


        if (unitsPerPackage < 1) {

            throw new Error("معامل التحويل يجب أن يكون 1 على الأقل.");

        }


        if (stockUnit === unit && unitsPerPackage !== 1) {

            throw new Error("معامل التحويل غير متوافق مع وحدات المنتج.");

        }


        const id = String(product.id || createId());


        if (ids.has(id)) {

            throw new Error("يوجد أكثر من منتج بنفس المعرف.");

        }


        ids.add(id);


        return {

            id: id,

            name: name,

            category: category,

            stockUnit: stockUnit,

            unit: unit,

            unitsPerPackage: unitsPerPackage,

            stockQuantity: stockQuantity,

            purchasePrice: purchasePrice,

            sellingPrice: sellingPrice,

            minimumStock: minimumStock

        };

    });

}


/* =========================================
   26. استعادة النسخة الاحتياطية
========================================= */

async function restoreBackup(file) {

    if (!file) {

        return;

    }


    try {

        if (file.size > 10 * 1024 * 1024) {

            throw new Error("حجم الملف أكبر من 10 ميجابايت.");

        }


        const textContent = await file.text();

        const parsed = JSON.parse(textContent);


        const backupProducts = Array.isArray(parsed)

            ? parsed

            : parsed.products;


        const restoredProducts = validateBackupProducts(backupProducts);


        const confirmed = window.confirm(

            "استعادة النسخة الاحتياطية ستستبدل قائمة المنتجات الحالية بالكامل. هل تريد المتابعة؟"

        );


        if (!confirmed) {

            return;

        }


        const previousProducts = products;


        products = restoredProducts;


        if (!saveProducts()) {

            products = previousProducts;

            return;

        }


        renderAll();


        showToast("تمت استعادة البيانات بنجاح.", "success");


    } catch (error) {

        console.error("خطأ في استعادة البيانات:", error);


        showToast(

            error.message || "تعذر قراءة النسخة الاحتياطية.",

            "error"

        );

    } finally {

        elements.restoreInput.value = "";

    }

}


/* =========================================
   27. القائمة الجانبية للموبايل
========================================= */

function toggleSidebar() {

    elements.sidebar.classList.toggle("open");

}


function closeSidebar() {

    elements.sidebar.classList.remove("open");

}


/* =========================================
   28. ربط الأزرار بالأحداث
========================================= */

// أزرار إضافة المنتجات.
document.getElementById("addProductBtn")

    .addEventListener("click", openAddModal);


document.getElementById("bannerAddBtn")

    .addEventListener("click", openAddModal);


document.getElementById("emptyAddBtn")

    .addEventListener("click", openAddModal);


// أزرار إغلاق نافذة المنتج.
document.getElementById("closeModalBtn")

    .addEventListener("click", closeProductModal);


document.getElementById("cancelModalBtn")

    .addEventListener("click", closeProductModal);


// حفظ المنتج.
elements.productForm.addEventListener(

    "submit",

    handleProductSubmit

);


// تحديث المعاينة عند تغيير البيانات.
[

    elements.productUnit,

    elements.stockUnit,

    elements.unitsPerPackage,

    elements.stockQuantity,

    elements.purchasePrice,

    elements.sellingPrice

].forEach(function (element) {

    element.addEventListener("input", updatePreview);

    element.addEventListener("change", updatePreview);

});


// تحديث الوحدات عند تغييرها.
elements.productUnit.addEventListener(

    "change",

    updateUnitSettings

);


elements.stockUnit.addEventListener(

    "change",

    updateUnitSettings

);


// البحث.
elements.searchInput.addEventListener(

    "input",

    renderProducts

);


// تصفية القسم والوحدة.
elements.categoryFilter.addEventListener(

    "change",

    renderProducts

);


elements.unitFilter.addEventListener(

    "change",

    renderProducts

);


// إعادة ضبط البحث والفلاتر.
elements.resetFiltersBtn.addEventListener("click", function () {

    elements.searchInput.value = "";

    elements.categoryFilter.value = "";

    elements.unitFilter.value = "";


    renderProducts();

});


// تعديل وحذف المنتجات باستخدام تفويض الأحداث.
elements.productsTableBody.addEventListener("click", function (event) {

    const button = event.target.closest("button[data-action]");


    if (!button) {

        return;

    }


    const action = button.dataset.action;

    const productId = button.dataset.id;


    if (action === "edit") {

        openEditModal(productId);

    }


    if (action === "delete") {

        openDeleteModal(productId);

    }

});


// تأكيد الحذف أو إلغاؤه.
document.getElementById("confirmDeleteBtn")

    .addEventListener("click", confirmDelete);


document.getElementById("cancelDeleteBtn")

    .addEventListener("click", closeDeleteModal);


// إغلاق النوافذ بالنقر على الخلفية.
elements.productModal.addEventListener("click", function (event) {

    if (event.target === elements.productModal) {

        closeProductModal();

    }

});


elements.deleteModal.addEventListener("click", function (event) {

    if (event.target === elements.deleteModal) {

        closeDeleteModal();

    }

});


// إغلاق النافذة بمفتاح Escape.
document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeProductModal();

        closeDeleteModal();

        closeSidebar();

    }

});


// تصدير CSV.
document.getElementById("exportCsvBtn")

    .addEventListener("click", exportCSV);


document.getElementById("backupCsvBtn")

    .addEventListener("click", exportCSV);


// النسخ الاحتياطي.
document.getElementById("backupBtn")

    .addEventListener("click", exportBackup);


// الاستعادة.
document.getElementById("restoreBtn")

    .addEventListener("click", function () {

        elements.restoreInput.click();

    });


elements.restoreInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    restoreBackup(file);

});


// القائمة الجانبية.
elements.menuToggle.addEventListener("click", toggleSidebar);


// إغلاق القائمة بعد اختيار قسم على الموبايل.
document.querySelectorAll(".nav-link").forEach(function (link) {

    link.addEventListener("click", function () {

        closeSidebar();


        document.querySelectorAll(".nav-link").forEach(function (item) {

            item.classList.remove("active");

        });


        link.classList.add("active");

    });

});


/* =========================================
   29. تشغيل الموقع عند الفتح
========================================= */

function initializeApp() {

    updateDate();

    renderAll();

    updateUnitSettings();

    updatePreview();

}


initializeApp();