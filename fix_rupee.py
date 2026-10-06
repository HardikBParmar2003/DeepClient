filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any escaped variations of the Rupee symbol
text = text.replace('{"\\\\u20B9"}', '₹')
text = text.replace('{"\\u20B9"}', '₹')
text = text.replace('{"\u20B9"}', '₹')
text = text.replace('\\u20B9', '₹')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed Rupee Symbol!')
