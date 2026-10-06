import re

filepath = r"D:\deep clothes\client\src\templates\ShivnetraChashamagharInvoice.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{shopConfig.address}", "{user?.shopAddress || shopConfig.address}")
content = content.replace("{shopConfig.phone}", "{user?.shopMobile || shopConfig.phone}")

# In case it is conditionally rendered:
content = content.replace("shopConfig.address &&", "(user?.shopAddress || shopConfig.address) &&")
content = content.replace("shopConfig.phone &&", "(user?.shopMobile || shopConfig.phone) &&")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Invoice Address and Phone")
